package postybirb

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"mime/multipart"
	"net/textproto"
	"net/url"
	"strings"
	"time"
)

type blueskySubmission struct {
	socialSubmission
	Type  string `json:"type"`
	Posts []struct {
		Completed bool `json:"completed"`
		Units     []struct {
			AccountID string `json:"accountId"`
			State     string `json:"state"`
			URL       string `json:"url"`
		} `json:"unitsOfWork"`
	} `json:"posts"`
}

func (c *Client) blueskySubmission(ctx context.Context, id string) (blueskySubmission, error) {
	var s blueskySubmission
	err := c.call(ctx, "GET", "/submissions/"+url.PathEscape(id), nil, &s)
	if err == nil && s.ID != id {
		err = errors.New("PostyBirb submission ID does not match")
	}
	return s, err
}

// CreateBluesky creates only a private unscheduled draft. The caller must save
// its identity before QueueBluesky can enable a future schedule.
func (c *Client) CreateBluesky(ctx context.Context, account, caption, alt string, media []byte) (string, error) {
	var body bytes.Buffer
	form := multipart.NewWriter(&body)
	kind := "MESSAGE"
	if len(media) > 0 {
		kind = "FILE"
	}
	for k, v := range map[string]string{"name": "SUBCULT approved Bluesky", "type": kind, "isTemplate": "false", "isMultiSubmission": "false"} {
		if err := form.WriteField(k, v); err != nil {
			return "", err
		}
	}
	if len(media) > 0 {
		header := textproto.MIMEHeader{}
		header.Set("Content-Disposition", `form-data; name="files"; filename="approved.jpg"`)
		header.Set("Content-Type", "image/jpeg")
		file, err := form.CreatePart(header)
		if err != nil {
			return "", err
		}
		if _, err = file.Write(media); err != nil {
			return "", err
		}
	}
	if err := form.Close(); err != nil {
		return "", err
	}
	var created []struct {
		ID string `json:"id"`
	}
	if err := c.call(ctx, "POST", form.FormDataContentType(), &body, &created); err != nil {
		return "", err
	}
	if len(created) != 1 || created[0].ID == "" {
		return "", errors.New("PostyBirb submission receipt is invalid")
	}
	id := created[0].ID
	for _, target := range []string{"NULL_ACCOUNT", account} {
		data := map[string]any{"title": "", "rating": "GENERAL", "tags": map[string]any{"overrideDefault": true, "tags": []string{}}, "description": map[string]any{"overrideDefault": true, "insertTags": false, "insertTitle": false, "description": literalDocument(caption)}}
		if err := c.call(ctx, "POST", "/website-option", map[string]any{"accountId": target, "submissionId": id, "isDefault": target == "NULL_ACCOUNT", "data": data}, nil); err != nil {
			return id, err
		}
	}
	if len(media) > 0 {
		s, err := c.blueskySubmission(ctx, id)
		if err != nil {
			return id, err
		}
		if len(s.Files) != 1 {
			return id, errors.New("PostyBirb image receipt is invalid")
		}
		var f struct {
			ID string `json:"id"`
		}
		if json.Unmarshal(s.Files[0], &f) != nil || f.ID == "" {
			return id, errors.New("PostyBirb image identity is missing")
		}
		if err = c.call(ctx, "PATCH", "/file-submission/metadata/"+url.PathEscape(f.ID), map[string]string{"altText": alt}, nil); err != nil {
			return id, err
		}
	}
	return id, nil
}

// ValidateBluesky verifies the sole target, literal copy, image count and alt
// text before asking PostyBirb to check its platform-specific constraints.
func (c *Client) ValidateBluesky(ctx context.Context, id, account, caption, alt string, hasMedia bool) error {
	s, err := c.blueskySubmission(ctx, id)
	if err != nil {
		return err
	}
	files, kind := 0, "MESSAGE"
	if hasMedia {
		files, kind = 1, "FILE"
	}
	if s.IsScheduled || s.Post != nil || len(s.Posts) > 0 || s.Type != kind || len(s.Files) != files {
		return errors.New("PostyBirb Bluesky draft changed")
	}
	if hasMedia {
		var f struct {
			Metadata struct {
				Alt string `json:"altText"`
			} `json:"metadata"`
		}
		if json.Unmarshal(s.Files[0], &f) != nil || f.Metadata.Alt != alt {
			return errors.New("PostyBirb image alt text changed")
		}
	}
	want, _ := json.Marshal(literalDocument(caption))
	targets := 0
	for _, o := range s.Options {
		if o.IsDefault {
			continue
		}
		targets++
		var doc node
		if o.AccountID != account || json.Unmarshal(o.Data.Description.Document, &doc) != nil {
			return errors.New("PostyBirb Bluesky target changed")
		}
		got, _ := json.Marshal(doc)
		if !bytes.Equal(got, want) {
			return errors.New("PostyBirb Bluesky copy changed")
		}
	}
	if targets != 1 {
		return errors.New("PostyBirb requires one exact Bluesky target")
	}
	var validations []struct {
		Account struct {
			ID string `json:"id"`
		} `json:"account"`
		Errors []json.RawMessage `json:"errors"`
	}
	if err = c.call(ctx, "GET", "/website-option/validate/"+url.PathEscape(id), nil, &validations); err != nil {
		return err
	}
	checked := false
	for _, v := range validations {
		if v.Account.ID == account {
			checked = true
		}
		if len(v.Errors) > 0 {
			return errors.New("PostyBirb Bluesky validation requires review")
		}
	}
	if !checked {
		return errors.New("PostyBirb Bluesky account validation missing")
	}
	return nil
}
func (c *Client) QueueBluesky(ctx context.Context, id, account, caption, alt string, hasMedia bool, due time.Time) error {
	if !due.After(time.Now()) || due.After(time.Now().AddDate(0, 0, 90)) {
		return errors.New("schedule must be in the future and within 90 days")
	}
	if err := c.ValidateBluesky(ctx, id, account, caption, alt, hasMedia); err != nil {
		return err
	}
	if err := c.call(ctx, "PATCH", "/submissions/"+url.PathEscape(id), map[string]any{"isScheduled": true, "scheduleType": "SINGLE", "scheduledFor": due.UTC().Format(time.RFC3339)}, nil); err != nil {
		return err
	}
	s, err := c.blueskySubmission(ctx, id)
	if err != nil {
		return err
	}
	if !s.IsScheduled || s.Schedule.Type != "SINGLE" || !s.Schedule.Due.Equal(due.UTC().Truncate(time.Second)) {
		return errors.New("PostyBirb Bluesky schedule could not be confirmed")
	}
	return nil
}
func (c *Client) BlueskyStatus(ctx context.Context, id, account string) (string, string, error) {
	s, err := c.blueskySubmission(ctx, id)
	if err != nil {
		return "", "", err
	}
	// V4 returns posts; retain compatibility with single-post receipts.
	if len(s.Posts) == 0 && s.Post != nil {
		for _, u := range s.Post.Units {
			if u.AccountID == account {
				return blueskyUnitStatus(u.State, u.URL)
			}
		}
	}
	for i := len(s.Posts) - 1; i >= 0; i-- {
		for _, u := range s.Posts[i].Units {
			if u.AccountID == account {
				return blueskyUnitStatus(u.State, u.URL)
			}
		}
	}
	if s.IsScheduled {
		return "QUEUE", "", nil
	}
	return "REVIEW", "", nil
}
func blueskyUnitStatus(state, link string) (string, string, error) {
	switch state {
	case "SUCCEEDED":
		u, err := url.Parse(link)
		if err != nil || u.Scheme != "https" || u.Host != "bsky.app" || u.User != nil || !blueskyPostPath(u.Path) {
			return "ERROR", "", nil
		}
		return "PUBLISHED", link, nil
	case "FAILED", "CANCELLED":
		return "ERROR", "", nil
	default:
		return "REVIEW", "", nil
	}
}
func blueskyPostPath(path string) bool {
	// A delivery URL must identify a post rather than a profile or arbitrary page.
	parts := strings.Split(path, "/")
	return len(parts) == 5 && parts[1] == "profile" && parts[2] != "" && parts[3] == "post" && parts[4] != ""
}
