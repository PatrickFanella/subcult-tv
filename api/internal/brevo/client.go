// Package brevo sends transactional email and manages the newsletter list
// through the Brevo v3 API.
package brevo

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const defaultBaseURL = "https://api.brevo.com/v3"

// Address is a named email address.
type Address struct {
	Name  string `json:"name,omitempty"`
	Email string `json:"email"`
}

// Email is a plain-text transactional message.
type Email struct {
	Sender      Address   `json:"sender"`
	To          []Address `json:"to"`
	ReplyTo     *Address  `json:"replyTo,omitempty"`
	Subject     string    `json:"subject"`
	TextContent string    `json:"textContent"`
}

// Newsletter configures double opt-in sign-ups. ListID and TemplateID are
// Brevo IDs; RedirectURL is where Brevo sends people after they confirm.
type Newsletter struct {
	ListID      int64
	TemplateID  int64
	RedirectURL string
}

// Enabled reports whether double opt-in sign-ups are configured.
func (n Newsletter) Enabled() bool {
	return n.ListID > 0 && n.TemplateID > 0 && n.RedirectURL != ""
}

// Client calls the Brevo API. A nil *Client is valid and disabled.
type Client struct {
	httpClient *http.Client
	apiKey     string
	baseURL    string
	newsletter Newsletter
}

// New returns a client, or nil when apiKey is empty so email stays off.
func New(apiKey string, newsletter Newsletter) *Client {
	if apiKey == "" {
		return nil
	}
	return &Client{
		httpClient: &http.Client{Timeout: 15 * time.Second},
		apiKey:     apiKey,
		baseURL:    defaultBaseURL,
		newsletter: newsletter,
	}
}

// NewsletterEnabled reports whether sign-ups should go through Brevo.
func (c *Client) NewsletterEnabled() bool {
	return c != nil && c.newsletter.Enabled()
}

// SendEmail sends a transactional email.
func (c *Client) SendEmail(ctx context.Context, e Email) error {
	return c.post(ctx, "/smtp/email", e)
}

// RequestDoubleOptIn emails a confirmation link. Brevo adds the contact to
// the newsletter list only after the link is clicked.
func (c *Client) RequestDoubleOptIn(ctx context.Context, email string) error {
	return c.post(ctx, "/contacts/doubleOptinConfirmation", map[string]any{
		"email":          email,
		"includeListIds": []int64{c.newsletter.ListID},
		"templateId":     c.newsletter.TemplateID,
		"redirectionUrl": c.newsletter.RedirectURL,
	})
}

// RemoveFromNewsletter removes a contact from the newsletter list.
func (c *Client) RemoveFromNewsletter(ctx context.Context, email string) error {
	path := fmt.Sprintf("/contacts/lists/%d/contacts/remove", c.newsletter.ListID)
	return c.post(ctx, path, map[string]any{"emails": []string{email}})
}

func (c *Client) post(ctx context.Context, path string, body any) error {
	payload, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("brevo: encode %s: %w", path, err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("brevo: build %s: %w", path, err)
	}
	req.Header.Set("api-key", c.apiKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("brevo: %s: %w", path, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}
	detail, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
	return fmt.Errorf("brevo: %s: HTTP %d: %s", path, resp.StatusCode, bytes.TrimSpace(detail))
}
