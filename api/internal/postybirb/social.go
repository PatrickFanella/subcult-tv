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

// SocialAccount preserves the dashboard contract without exposing account data.
type SocialAccount struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Identifier string `json:"identifier"`
	Profile    string `json:"profile"`
	Disabled   bool   `json:"disabled"`
}
type SocialPost struct {
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
type socialSubmission struct {
	ID          string `json:"id"`
	IsScheduled bool   `json:"isScheduled"`
	Schedule    struct {
		Type string    `json:"scheduleType"`
		Due  time.Time `json:"scheduledFor"`
	} `json:"schedule"`
	Options []struct {
		AccountID string `json:"accountId"`
		IsDefault bool   `json:"isDefault"`
		Data      struct {
			Description struct {
				Document json.RawMessage `json:"description"`
			} `json:"description"`
		} `json:"data"`
	} `json:"options"`
	Files       []json.RawMessage `json:"files"`
	Validations []struct {
		Errors []json.RawMessage `json:"errors"`
	} `json:"validations"`
	Post *struct {
		Units []struct {
			AccountID string `json:"accountId"`
			State     string `json:"state"`
			URL       string `json:"url"`
		} `json:"unitsOfWork"`
	} `json:"post"`
}

func (c *Client) Accounts(ctx context.Context) ([]SocialAccount, error) {
	var accounts []struct {
		ID      string `json:"id"`
		Name    string `json:"name"`
		Website string `json:"website"`
		State   struct {
			Status     string `json:"status"`
			IsLoggedIn bool   `json:"isLoggedIn"`
			Pending    bool   `json:"pending"`
		} `json:"state"`
	}
	if err := c.call(ctx, "GET", "/account", nil, &accounts); err != nil {
		return nil, err
	}
	result := []SocialAccount{}
	for _, a := range accounts {
		if a.Website == "instagram" {
			result = append(result, SocialAccount{ID: a.ID, Name: a.Name, Identifier: a.Website, Disabled: !a.State.IsLoggedIn || a.State.Status != "loggedIn" || a.State.Pending})
		}
	}
	return result, nil
}
func literalDocument(caption string) node {
	content := []node{}
	for _, line := range strings.Split(caption, "\n") {
		paragraph := []node{}
		if line != "" {
			paragraph = append(paragraph, node{"type": "text", "text": line})
		}
		content = append(content, node{"type": "paragraph", "content": paragraph})
	}
	return node{"type": "doc", "content": content}
}

// CreateInstagram creates a private, unscheduled file submission. The caller
// must persist its ID before enabling the scheduler. It never starts posting.
func (c *Client) CreateInstagram(ctx context.Context, account, caption string, media []byte) (string, error) {
	var body bytes.Buffer
	form := multipart.NewWriter(&body)
	for k, v := range map[string]string{"name": "SUBCULT approved Instagram", "type": "FILE", "isTemplate": "false", "isMultiSubmission": "false"} {
		if err := form.WriteField(k, v); err != nil {
			return "", err
		}
	}
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
	if err = form.Close(); err != nil {
		return "", err
	}
	var created []struct {
		ID string `json:"id"`
	}
	if err = c.call(ctx, "POST", form.FormDataContentType(), &body, &created); err != nil {
		return "", err
	}
	if len(created) != 1 || created[0].ID == "" {
		return "", errors.New("PostyBirb submission receipt is invalid")
	}
	id := created[0].ID
	// Populate the default caption too: the native scheduler validates default
	// options even when the target overrides them.
	if err = c.call(ctx, "POST", "/website-option", map[string]any{"accountId": "NULL_ACCOUNT", "submissionId": id, "isDefault": true, "data": map[string]any{"title": "", "rating": "GENERAL", "tags": map[string]any{"overrideDefault": true, "tags": []string{}}, "description": map[string]any{"overrideDefault": true, "insertTags": false, "insertTitle": false, "description": literalDocument(caption)}}}, nil); err != nil {
		return id, err
	}
	err = c.call(ctx, "POST", "/website-option", map[string]any{"accountId": account, "submissionId": id, "isDefault": false, "data": map[string]any{"rating": "GENERAL", "tags": map[string]any{"overrideDefault": true, "tags": []string{}}, "description": map[string]any{"overrideDefault": true, "insertTags": false, "insertTitle": false, "description": literalDocument(caption)}}}, nil)
	return id, err
}
func (c *Client) submission(ctx context.Context, id string) (socialSubmission, error) {
	var s socialSubmission
	err := c.call(ctx, "GET", "/submissions/"+url.PathEscape(id), nil, &s)
	if err == nil && s.ID != id {
		err = errors.New("PostyBirb submission ID does not match")
	}
	return s, err
}

// QueueInstagram verifies the exact caption and sole target before setting a
// future SINGLE schedule, then confirms the account-specific schedule readback.
func (c *Client) QueueInstagram(ctx context.Context, id, account, caption string, due time.Time) error {
	if due.Before(time.Now().Add(24*time.Hour)) || due.After(time.Now().AddDate(0, 0, 90)) {
		return errors.New("schedule must be 24 hours to 90 days ahead")
	}
	s, err := c.submission(ctx, id)
	if err != nil {
		return err
	}
	if s.IsScheduled || s.Post != nil || len(s.Files) != 1 {
		return errors.New("PostyBirb draft is not an unscheduled single image")
	}
	targets := 0
	want, _ := json.Marshal(literalDocument(caption))
	for _, o := range s.Options {
		if !o.IsDefault {
			targets++
			if o.AccountID != account {
				return errors.New("PostyBirb target changed")
			}
			var got node
			if json.Unmarshal(o.Data.Description.Document, &got) != nil {
				return errors.New("PostyBirb caption missing")
			}
			encoded, _ := json.Marshal(got)
			if !bytes.Equal(encoded, want) {
				return errors.New("PostyBirb caption changed")
			}
		}
	}
	if targets != 1 {
		return errors.New("PostyBirb requires one exact target")
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
	validatedTarget := false
	for _, v := range validations {
		if v.Account.ID == account {
			validatedTarget = true
		}
		if len(v.Errors) > 0 {
			return errors.New("PostyBirb validation requires review")
		}
	}
	if !validatedTarget {
		return errors.New("PostyBirb account validation missing")
	}

	if err = c.call(ctx, "PATCH", "/submissions/"+url.PathEscape(id), map[string]any{"isScheduled": true, "scheduleType": "SINGLE", "scheduledFor": due.UTC().Format(time.RFC3339)}, nil); err != nil {
		return err
	}
	s, err = c.submission(ctx, id)
	if err != nil {
		return err
	}
	if !s.IsScheduled || s.Schedule.Type != "SINGLE" || !s.Schedule.Due.Equal(due.UTC().Truncate(time.Second)) {
		return errors.New("PostyBirb schedule could not be confirmed")
	}
	return nil
}

// SocialStatus observes one locally approved receipt, never unrelated drafts.
func (c *Client) SocialStatus(ctx context.Context, id, account string) (string, string, error) {
	s, err := c.submission(ctx, id)
	if err != nil {
		return "", "", err
	}
	if s.Post != nil {
		for _, u := range s.Post.Units {
			if u.AccountID == account {
				switch u.State {
				case "SUCCEEDED":
					parsed, e := url.Parse(u.URL)
					if e != nil || parsed.Scheme != "https" || (parsed.Hostname() != "instagram.com" && parsed.Hostname() != "www.instagram.com") {
						return "ERROR", "", nil
					}
					return "PUBLISHED", u.URL, nil
				case "FAILED", "CANCELLED":
					return "ERROR", "", nil
				}
			}
		}
	}
	if s.IsScheduled {
		return "QUEUE", "", nil
	}
	return "REVIEW", "", nil
}

// ErrNotQueued means the submission was checked and no mutation was sent: it
// is already posting, posted, unscheduled or no longer matches the receipt.
var ErrNotQueued = errors.New("PostyBirb submission is no longer an unposted scheduled image")

// queued confirms one scheduled, unposted single-image submission whose sole
// target still carries the expected caption.
func (c *Client) queued(ctx context.Context, id, account, caption string) error {
	s, err := c.submission(ctx, id)
	if err != nil {
		return err
	}
	if !s.IsScheduled || s.Post != nil || len(s.Files) != 1 || s.Schedule.Type != "SINGLE" {
		return ErrNotQueued
	}
	want, _ := json.Marshal(literalDocument(caption))
	targets := 0
	for _, o := range s.Options {
		if o.IsDefault {
			continue
		}
		targets++
		var got node
		if o.AccountID != account || json.Unmarshal(o.Data.Description.Document, &got) != nil {
			return ErrNotQueued
		}
		if encoded, _ := json.Marshal(got); !bytes.Equal(encoded, want) {
			return ErrNotQueued
		}
	}
	if targets != 1 {
		return ErrNotQueued
	}
	return nil
}

// RescheduleInstagram moves a queued submission to a new time without
// touching its caption or image, then confirms the readback.
func (c *Client) RescheduleInstagram(ctx context.Context, id, account, caption string, due time.Time) error {
	if due.Before(time.Now().Add(24*time.Hour)) || due.After(time.Now().AddDate(0, 0, 90)) {
		return ErrNotQueued
	}
	if err := c.queued(ctx, id, account, caption); err != nil {
		return err
	}
	if err := c.call(ctx, "PATCH", "/submissions/"+url.PathEscape(id), map[string]any{"isScheduled": true, "scheduleType": "SINGLE", "scheduledFor": due.UTC().Format(time.RFC3339)}, nil); err != nil {
		return err
	}
	s, err := c.submission(ctx, id)
	if err != nil {
		return err
	}
	if !s.IsScheduled || s.Schedule.Type != "SINGLE" || !s.Schedule.Due.Equal(due.UTC().Truncate(time.Second)) {
		return errors.New("PostyBirb schedule could not be confirmed")
	}
	return nil
}

// WithdrawInstagram unschedules a queued submission, confirms it can no longer
// post, then deletes it. A failed delete leaves an unscheduled private draft.
func (c *Client) WithdrawInstagram(ctx context.Context, id, account, caption string) (deleted bool, err error) {
	if err = c.queued(ctx, id, account, caption); err != nil {
		return false, err
	}
	if err = c.call(ctx, "PATCH", "/submissions/"+url.PathEscape(id), map[string]any{"scheduleType": "NONE"}, nil); err != nil {
		return false, err
	}
	s, err := c.submission(ctx, id)
	if err != nil {
		return false, err
	}
	if s.IsScheduled || s.Post != nil {
		return false, errors.New("PostyBirb unschedule could not be confirmed")
	}
	return c.call(ctx, "DELETE", "/submissions?ids="+url.QueryEscape(id), nil, nil) == nil, nil
}
