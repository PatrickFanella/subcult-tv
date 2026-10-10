package buffer

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"
)

type Client struct {
	URL, Key, Organization string
	HTTP                   *http.Client
}
type Channel struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Service      string `json:"service"`
	Disconnected bool   `json:"isDisconnected"`
	Locked       bool   `json:"isLocked"`
	Paused       bool   `json:"isQueuePaused"`
}
type Post struct {
	ID        string    `json:"id"`
	Text      string    `json:"text"`
	ChannelID string    `json:"channelId"`
	Due       time.Time `json:"dueAt"`
	Status    string    `json:"status"`
	Actions   []string  `json:"allowedActions"`
}

func New(key, organization string) *Client {
	if key == "" || organization == "" {
		return nil
	}
	return &Client{URL: "https://api.buffer.com", Key: key, Organization: organization, HTTP: &http.Client{Timeout: 25 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}}
}
func (c *Client) query(ctx context.Context, query string, variables any, result any) error {
	body, err := json.Marshal(map[string]any{"query": query, "variables": variables})
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, "POST", c.URL, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.Key)
	req.Header.Set("Content-Type", "application/json")
	response, err := c.HTTP.Do(req)
	if err != nil {
		return errors.New("Buffer response could not be confirmed")
	}
	defer response.Body.Close()
	if response.StatusCode == 429 {
		return errors.New("Buffer rate limit reached; wait before checking again")
	}
	if response.StatusCode != 200 {
		return errors.New("Buffer request was not accepted")
	}
	var envelope struct {
		Data   json.RawMessage   `json:"data"`
		Errors []json.RawMessage `json:"errors"`
	}
	if json.NewDecoder(io.LimitReader(response.Body, 8<<20)).Decode(&envelope) != nil || len(envelope.Errors) > 0 || len(envelope.Data) == 0 {
		return errors.New("Buffer returned an invalid API response")
	}
	return json.Unmarshal(envelope.Data, result)
}
func (c *Client) Channels(ctx context.Context) ([]Channel, error) {
	var data struct {
		Channels []Channel `json:"channels"`
	}
	err := c.query(ctx, `query($input: ChannelsInput!){channels(input:$input){id name service isDisconnected isLocked isQueuePaused}}`, map[string]any{"input": map[string]string{"organizationId": c.Organization}}, &data)
	return data.Channels, err
}

const fields = `id text channelId dueAt status allowedActions`

// Metric is one engagement number Buffer refreshes about once a day.
type Metric struct {
	Type  string      `json:"type"`
	Value json.Number `json:"value"`
}

// HistoryPost is a read-only delivery record: when it went out, where, and
// why it failed. It is never used to decide whether to write.
type HistoryPost struct {
	Post
	SentAt       *time.Time `json:"sentAt"`
	ExternalLink string     `json:"externalLink"`
	Via          string     `json:"via"`
	Error        *struct {
		Message string `json:"message"`
	} `json:"error"`
	Metrics          []Metric   `json:"metrics"`
	MetricsUpdatedAt *time.Time `json:"metricsUpdatedAt"`
}

const historyFields = fields + ` sentAt externalLink via error{message} metrics{type value} metricsUpdatedAt`

func (c *Client) Posts(ctx context.Context, channels []string, since time.Time) ([]Post, error) {
	return pagePosts[Post](ctx, c, channels, since, fields)
}

// History returns posts due since `since` with delivery outcome and metrics.
func (c *Client) History(ctx context.Context, channels []string, since time.Time) ([]HistoryPost, error) {
	return pagePosts[HistoryPost](ctx, c, channels, since, historyFields)
}

func pagePosts[T any](ctx context.Context, c *Client, channels []string, since time.Time, fields string) ([]T, error) {
	result := []T{}
	cursor := ""
	for page := 0; page < 20; page++ {
		var data struct {
			Posts struct {
				Edges []struct {
					Node T `json:"node"`
				} `json:"edges"`
				PageInfo struct {
					Next   bool   `json:"hasNextPage"`
					Cursor string `json:"endCursor"`
				} `json:"pageInfo"`
			} `json:"posts"`
		}
		vars := map[string]any{"after": nil, "input": map[string]any{"organizationId": c.Organization, "filter": map[string]any{"channelIds": channels, "dueAt": map[string]string{"start": since.UTC().Format(time.RFC3339)}}, "sort": []any{map[string]string{"field": "dueAt", "direction": "desc"}}}}
		if cursor != "" {
			vars["after"] = cursor
		}
		if err := c.query(ctx, `query($input:PostsInput!,$after:String){posts(first:100,after:$after,input:$input){edges{node{`+fields+`}}pageInfo{hasNextPage endCursor}}}`, vars, &data); err != nil {
			return nil, err
		}
		for _, e := range data.Posts.Edges {
			result = append(result, e.Node)
		}
		if !data.Posts.PageInfo.Next {
			return result, nil
		}
		if data.Posts.PageInfo.Cursor == "" || data.Posts.PageInfo.Cursor == cursor {
			return nil, errors.New("Buffer history pagination is incomplete")
		}
		cursor = data.Posts.PageInfo.Cursor
	}
	return nil, errors.New("Buffer history exceeds the inspection limit")
}
func (c *Client) Post(ctx context.Context, id string) (Post, error) {
	var data struct {
		Post Post `json:"post"`
	}
	err := c.query(ctx, `query($input:PostInput!){post(input:$input){`+fields+`}}`, map[string]any{"input": map[string]string{"id": id}}, &data)
	if err == nil && data.Post.ID != id {
		err = errors.New("Buffer post ID does not match")
	}
	return data.Post, err
}
func (c *Client) write(ctx context.Context, operation, inputType string, input map[string]any) (Post, error) {
	var data map[string]struct {
		Post    *Post  `json:"post"`
		Message string `json:"message"`
	}
	err := c.query(ctx, `mutation($input:`+inputType+`!){`+operation+`(input:$input){... on PostActionSuccess{post{`+fields+`}}... on MutationError{message}}}`, map[string]any{"input": input}, &data)
	if err != nil {
		return Post{}, err
	}
	r := data[operation]
	if r.Post == nil || r.Post.ID == "" {
		return Post{}, errors.New("Buffer did not confirm the scheduled post")
	}
	return *r.Post, nil
}
func (c *Client) Schedule(ctx context.Context, channel, text string, due time.Time) (Post, error) {
	return c.write(ctx, "createPost", "CreatePostInput", map[string]any{"channelId": channel, "text": text, "dueAt": due.UTC().Format(time.RFC3339), "mode": "customScheduled", "schedulingType": "automatic", "assets": []any{}, "needsApproval": false, "saveToDraft": false})
}
func (c *Client) Reschedule(ctx context.Context, id, text string, due time.Time) (Post, error) {
	return c.write(ctx, "editPost", "EditPostInput", map[string]any{"id": id, "text": text, "dueAt": due.UTC().Format(time.RFC3339), "mode": "customScheduled", "schedulingType": "automatic", "saveToDraft": false})
}
