package postybirb

import (
	"bytes"
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"crypto/tls"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	endpoint, password, account string
	http                        *http.Client
}
type Audience struct {
	Value string `json:"value"`
	Label string `json:"label"`
}
type Account struct {
	ID      string `json:"id"`
	Website string `json:"website"`
	State   struct {
		Status      string     `json:"status"`
		IsLoggedIn  bool       `json:"isLoggedIn"`
		LastUpdated *time.Time `json:"lastUpdated"`
	} `json:"state"`
	Data struct {
		Folders []Audience `json:"folders"`
	} `json:"data"`
}

// New requires HTTPS and a pinned server certificate for the private service.
func New(endpoint, password, account, pin string) *Client {
	u, err := url.Parse(endpoint)
	hash, e := hex.DecodeString(pin)
	if err != nil || u.Scheme != "https" || u.Host == "" || u.User != nil || u.RawQuery != "" || e != nil || len(hash) != 32 || len(password) < 32 || account == "" {
		return nil
	}
	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.TLSClientConfig = &tls.Config{MinVersion: tls.VersionTLS12, InsecureSkipVerify: true, VerifyConnection: func(cs tls.ConnectionState) error {
		if len(cs.PeerCertificates) == 0 {
			return errors.New("missing pinned certificate")
		}
		got := sha256.Sum256(cs.PeerCertificates[0].Raw)
		if subtle.ConstantTimeCompare(got[:], hash) != 1 {
			return errors.New("server certificate changed")
		}
		return nil
	}}
	return &Client{strings.TrimRight(endpoint, "/"), password, account, &http.Client{Transport: transport, Timeout: 20 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}}
}
func (c *Client) call(ctx context.Context, method, path string, input, output any) error {
	var body io.Reader
	contentType := "application/json"
	if b, ok := input.(*bytes.Buffer); ok {
		body = b
		contentType = path
		path = "/submissions"
	} else if input != nil {
		data, err := json.Marshal(input)
		if err != nil {
			return err
		}
		body = bytes.NewReader(data)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.endpoint+path, body)
	if err != nil {
		return err
	}
	req.Header.Set("x-remote-password", c.password)
	req.Header.Set("Content-Type", contentType)
	response, err := c.http.Do(req)
	if err != nil {
		return errors.New("PostyBirb request could not be confirmed")
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return errors.New("PostyBirb rejected the request")
	}
	if output != nil {
		return json.NewDecoder(io.LimitReader(response.Body, 2<<20)).Decode(output)
	}
	return nil
}
func (c *Client) Ready(ctx context.Context, refresh bool) ([]Audience, error) {
	if c == nil {
		return nil, errors.New("Patreon connection is not configured")
	}
	if refresh {
		if err := c.call(ctx, "GET", "/account/refresh/"+url.PathEscape(c.account), nil, nil); err != nil {
			return nil, err
		}
	}
	var a Account
	if err := c.call(ctx, "GET", "/account/"+url.PathEscape(c.account), nil, &a); err != nil {
		return nil, err
	}
	if a.ID != c.account || a.Website != "patreon" || !a.State.IsLoggedIn || a.State.Status != "loggedIn" || a.State.LastUpdated == nil || time.Since(*a.State.LastUpdated) > 10*time.Minute || a.State.LastUpdated.After(time.Now().Add(time.Minute)) {
		return nil, errors.New("Patreon login needs verification")
	}
	if len(a.Data.Folders) == 0 {
		return nil, errors.New("Patreon audiences are unavailable")
	}
	return a.Data.Folders, nil
}
func (c *Client) Create(ctx context.Context, title string, doc node, due time.Time, audience string) (string, error) {
	var body bytes.Buffer
	form := multipart.NewWriter(&body)
	for k, v := range map[string]string{"name": title, "type": "MESSAGE", "isTemplate": "false", "isMultiSubmission": "false"} {
		if err := form.WriteField(k, v); err != nil {
			return "", err
		}
	}
	form.Close()
	var created []struct {
		ID string `json:"id"`
	}
	if err := c.call(ctx, "POST", form.FormDataContentType(), &body, &created); err != nil {
		return "", err
	}
	if len(created) != 1 || created[0].ID == "" {
		return "", errors.New("submission receipt is invalid")
	}
	id := created[0].ID
	err := c.call(ctx, "POST", "/website-option", map[string]any{"accountId": c.account, "submissionId": id, "isDefault": false, "data": map[string]any{
		"title": title, "description": map[string]any{"overrideDefault": true, "insertTags": false, "insertTitle": false, "description": doc}, "tiers": []string{audience}, "collections": []string{}, "schedule": due.UTC().Format(time.RFC3339), "charge": false}}, nil)
	return id, err
}
func (c *Client) Start(ctx context.Context, id string) error {
	return c.call(ctx, "POST", "/posting", map[string]any{"submissionId": id, "evictions": map[string]any{}, "targets": map[string]any{c.account: []string{}}}, nil)
}

// Receipt only treats an account-specific successful unit as accepted scheduling.
func (c *Client) Receipt(ctx context.Context, id string) (bool, string, error) {
	var response struct {
		Post *struct {
			Units []struct {
				AccountID string `json:"accountId"`
				State     string `json:"state"`
				URL       string `json:"url"`
			} `json:"unitsOfWork"`
		} `json:"post"`
	}
	if err := c.call(ctx, "GET", "/submissions/"+url.PathEscape(id), nil, &response); err != nil {
		return false, "", err
	}
	if response.Post == nil {
		return false, "", nil
	}
	for _, unit := range response.Post.Units {
		if unit.AccountID != c.account {
			continue
		}
		if unit.State == "FAILED" || unit.State == "CANCELLED" {
			return false, "", errors.New("Patreon delivery requires review")
		}
		if unit.State == "SUCCEEDED" {
			u, e := url.Parse(unit.URL)
			if e != nil || u.Scheme != "https" || (u.Hostname() != "www.patreon.com" && u.Hostname() != "patreon.com") {
				return false, "", errors.New("Patreon receipt URL is missing")
			}
			return true, unit.URL, nil
		}
	}
	return false, "", nil
}
