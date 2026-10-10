package buffer

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestSchedulingContract(t *testing.T) {
	due := time.Date(2026, 10, 8, 14, 0, 0, 0, time.FixedZone("Chicago", -5*3600))
	for _, edit := range []bool{false, true} {
		t.Run(map[bool]string{false: "create", true: "edit"}[edit], func(t *testing.T) {
			calls := 0
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				calls++
				if r.Method != "POST" || r.Header.Get("Authorization") != "Bearer private-key" {
					t.Error("missing authenticated GraphQL POST")
				}
				var body struct {
					Query     string `json:"query"`
					Variables struct {
						Input map[string]any `json:"input"`
					} `json:"variables"`
				}
				if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
					t.Fatal(err)
				}
				input := body.Variables.Input
				if input["dueAt"] != "2026-10-08T19:00:00Z" || input["mode"] != "customScheduled" || input["text"] != "Exact tweet" {
					t.Error("wrong scheduling payload", input)
				}
				op := "createPost"
				if edit {
					op = "editPost"
					if input["id"] != "post-1" {
						t.Error("editing wrong post")
					}
					if _, ok := input["assets"]; ok {
						t.Error("edit must preserve existing assets")
					}
				} else if input["channelId"] != "channel-1" || input["needsApproval"] != false {
					t.Error("wrong channel or approval")
				}
				if !strings.Contains(body.Query, op+"(input:$input)") {
					t.Error("wrong mutation")
				}
				json.NewEncoder(w).Encode(map[string]any{"data": map[string]any{op: map[string]any{"post": Post{ID: "post-1", ChannelID: "channel-1", Text: "Exact tweet", Due: due.UTC(), Status: "scheduled"}}}})
			}))
			defer server.Close()
			client := New("private-key", "org")
			client.URL = server.URL
			var p Post
			var err error
			if edit {
				p, err = client.Reschedule(context.Background(), "post-1", "Exact tweet", nil, due)
			} else {
				p, err = client.Schedule(context.Background(), "channel-1", "Exact tweet", nil, due)
			}
			if err != nil || p.ID != "post-1" || calls != 1 {
				t.Fatal("unconfirmed or repeated write", p, err, calls)
			}
		})
	}
}

func TestUnknownWriteIsNeverRetriedOrLeaked(t *testing.T) {
	for _, response := range []string{`{"errors":[{"message":"private-key"}]}`, `{"data":{"createPost":{"message":"private-key"}}}`, `invalid`} {
		calls := 0
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { calls++; w.Write([]byte(response)) }))
		client := New("private-key", "org")
		client.URL = server.URL
		_, err := client.Schedule(context.Background(), "channel", "Tweet", nil, time.Now())
		server.Close()
		if err == nil || strings.Contains(err.Error(), "private-key") || calls != 1 {
			t.Fatal("unsafe failure", err, calls)
		}
	}
}

func TestIncompleteHistoryIsRejected(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"data":{"posts":{"edges":[],"pageInfo":{"hasNextPage":true,"endCursor":""}}}}`))
	}))
	defer server.Close()
	client := New("key", "org")
	client.URL = server.URL
	if _, err := client.Posts(context.Background(), []string{"channel"}, time.Now()); err == nil {
		t.Fatal("incomplete history accepted")
	}
}

func TestHistoryReadsOutcomeAndMetrics(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Query string `json:"query"`
		}
		json.NewDecoder(r.Body).Decode(&body)
		if strings.Contains(body.Query, "mutation") || !strings.Contains(body.Query, "externalLink") {
			t.Error("history must be a read query with delivery fields", body.Query)
		}
		w.Write([]byte(`{"data":{"posts":{"edges":[{"node":{"id":"p1","text":"t","channelId":"c","dueAt":"2026-10-07T15:00:00Z","status":"error","sentAt":null,"externalLink":null,"via":"buffer","error":{"message":"Token expired"},"metrics":[{"type":"impressions","value":4},{"type":"engagementRate","value":2.5}]}}],"pageInfo":{"hasNextPage":false,"endCursor":""}}}}`))
	}))
	defer server.Close()
	client := New("private-key", "org")
	client.URL = server.URL
	posts, err := client.History(context.Background(), []string{"c"}, time.Now())
	if err != nil || len(posts) != 1 || posts[0].Error == nil || posts[0].Error.Message != "Token expired" || posts[0].Metrics[1].Value.String() != "2.5" {
		t.Fatal("history not decoded", posts, err)
	}
}

func TestThreadPayloadAndReadback(t *testing.T) {
	var sent map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Variables struct {
				Input map[string]any `json:"input"`
			} `json:"variables"`
		}
		json.NewDecoder(r.Body).Decode(&body)
		sent = body.Variables.Input
		w.Write([]byte(`{"data":{"createPost":{"post":{"id":"p","text":"Opener","channelId":"c","status":"scheduled","metadata":{"thread":[{"text":"Opener"},{"text":"Reply"}]}}}}}`))
	}))
	defer server.Close()
	client := New("key", "org")
	client.URL = server.URL
	post, err := client.Schedule(context.Background(), "c", "Opener", []string{"Reply"}, time.Now())
	if err != nil {
		t.Fatal(err)
	}
	thread := sent["metadata"].(map[string]any)["twitter"].(map[string]any)["thread"].([]any)
	if len(thread) != 2 || thread[0].(map[string]any)["text"] != "Opener" || thread[1].(map[string]any)["text"] != "Reply" {
		t.Fatal("thread must list the opener then its replies", thread)
	}
	if replies := post.Replies(); len(replies) != 1 || replies[0] != "Reply" {
		t.Fatal("thread readback", replies)
	}
}

func TestRefusalIsDefiniteAndRedacted(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"data":{"createPost":{"message":"Thread limit reached for key"}}}`))
	}))
	defer server.Close()
	client := New("key", "org")
	client.URL = server.URL
	_, err := client.Schedule(context.Background(), "c", "Opener", []string{"Reply"}, time.Now())
	var rejected *Rejected
	if !errors.As(err, &rejected) || strings.Contains(rejected.Message, "key") {
		t.Fatal("refusal not typed or not redacted", err)
	}
}
