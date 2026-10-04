package postiz

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"
)

// Client uses Postiz's organization API key only on the server.
type Client struct {
	BaseURL, Key string
	HTTP         *http.Client
}
type Account struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Identifier string `json:"identifier"`
	Profile    string `json:"profile"`
	Disabled   bool   `json:"disabled"`
}
type Post struct {
	ID          string `json:"id"`
	Content     string `json:"content"`
	PublishDate string `json:"publishDate"`
	ReleaseURL  string `json:"releaseURL"`
	State       string `json:"state"`
	Integration struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"integration"`
}
type Receipt struct {
	PostID      string `json:"postId"`
	Integration string `json:"integration"`
}

func New(base, key string) *Client {
	if base == "" || key == "" {
		return nil
	}
	return &Client{strings.TrimRight(base, "/"), key, &http.Client{Timeout: 20 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}}
}
func (c *Client) call(ctx context.Context, method, path string, body, result any) error {
	var payload []byte
	var err error
	if body != nil {
		payload, err = json.Marshal(body)
		if err != nil {
			return err
		}
	}
	r, err := http.NewRequestWithContext(ctx, method, c.BaseURL+path, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	r.Header.Set("Authorization", c.Key)
	r.Header.Set("Content-Type", "application/json")
	resp, err := c.HTTP.Do(r)
	if err != nil {
		return errors.New("Postiz request could not be confirmed")
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return errors.New("Postiz rejected the request; inspect Postiz before retrying")
	}
	if err = json.NewDecoder(io.LimitReader(resp.Body, 4<<20)).Decode(result); err != nil {
		return errors.New("Postiz returned an invalid response")
	}
	return nil
}
func (c *Client) Accounts(ctx context.Context) ([]Account, error) {
	a := []Account{}
	e := c.call(ctx, "GET", "/integrations", nil, &a)
	return a, e
}
func (c *Client) Posts(ctx context.Context) ([]Post, error) {
	var result struct {
		Posts []Post `json:"posts"`
	}
	start := time.Now().UTC().AddDate(0, 0, -30).Format(time.RFC3339)
	end := time.Now().UTC().AddDate(0, 0, 90).Format(time.RFC3339)
	e := c.call(ctx, "GET", "/posts?startDate="+start+"&endDate="+end, nil, &result)
	return result.Posts, e
}
func (c *Client) Schedule(ctx context.Context, account Account, caption, mediaID, mediaURL string, due time.Time) ([]Receipt, error) {
	body := map[string]any{"type": "schedule", "date": due.UTC().Format(time.RFC3339), "shortLink": false, "tags": []any{}, "posts": []any{map[string]any{
		"integration": map[string]string{"id": account.ID}, "value": []any{map[string]any{"content": caption, "image": []any{map[string]string{"id": mediaID, "path": mediaURL}}}},
		"settings": map[string]any{"__type": account.Identifier, "post_type": "post"},
	}}}
	var receipt []Receipt
	e := c.call(ctx, "POST", "/posts", body, &receipt)
	if e == nil && (len(receipt) != 1 || receipt[0].PostID == "" || receipt[0].Integration != account.ID) {
		e = errors.New("Postiz schedule result could not be confirmed")
	}
	return receipt, e
}
