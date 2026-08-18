package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// Helper to create a test request with JSON body.
func newJSONRequest(t *testing.T, method, path string, body interface{}) *http.Request {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatalf("failed to encode request body: %v", err)
		}
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	return req
}

// TestHealthEndpoint tests that a simple health check can be implemented.
// This is a placeholder showing the testing pattern.
func TestHealthEndpoint(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}

	expected := `{"status":"ok"}`
	if recorder.Body.String() != expected {
		t.Errorf("expected body %s, got %s", expected, recorder.Body.String())
	}
}

// TestWriteJSON tests the JSON response helper.
func TestWriteJSON(t *testing.T) {
	data := map[string]string{"message": "test"}
	recorder := httptest.NewRecorder()

	writeJSON(recorder, http.StatusOK, data)

	if recorder.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, recorder.Code)
	}
	if contentType := recorder.Header().Get("Content-Type"); contentType != "application/json" {
		t.Errorf("expected Content-Type application/json, got %s", contentType)
	}
	var result map[string]string
	if err := json.NewDecoder(recorder.Body).Decode(&result); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if result["message"] != "test" {
		t.Errorf("expected message 'test', got '%s'", result["message"])
	}
}

// TestWriteError tests the error response helper.
func TestWriteError(t *testing.T) {
	recorder := httptest.NewRecorder()

	writeError(recorder, http.StatusBadRequest, "validation failed")

	if recorder.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, recorder.Code)
	}
	var result map[string]interface{}
	if err := json.NewDecoder(recorder.Body).Decode(&result); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if result["error"] != "validation failed" {
		t.Errorf("expected error 'validation failed', got '%v'", result["error"])
	}
	if result["code"].(float64) != float64(http.StatusBadRequest) {
		t.Errorf("expected code %d, got %v", http.StatusBadRequest, result["code"])
	}
}

// TestTotalPages tests the total pages calculation.
func TestTotalPages(t *testing.T) {
	tests := []struct {
		total    int64
		perPage  int
		expected int
	}{
		{0, 20, 0},
		{10, 20, 1},
		{20, 20, 1},
		{21, 20, 2},
		{100, 20, 5},
		{101, 20, 6},
	}

	for _, tt := range tests {
		result := totalPages(tt.total, tt.perPage)
		if result != tt.expected {
			t.Errorf("totalPages(%d, %d) = %d, expected %d", tt.total, tt.perPage, result, tt.expected)
		}
	}
}

// TestPagination tests the pagination helper.
func TestPagination(t *testing.T) {
	tests := []struct {
		name            string
		query           string
		expectedPage    int
		expectedPerPage int
		expectedOffset  int
	}{
		{"defaults", "", 1, 20, 0},
		{"page 2", "page=2", 2, 20, 20},
		{"custom per_page", "page=1&per_page=50", 1, 50, 0},
		{"page 3 with per_page 10", "page=3&per_page=10", 3, 10, 20},
		{"invalid page defaults to 1", "page=-1", 1, 20, 0},
		{"per_page capped at 100", "per_page=500", 1, 20, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/?"+tt.query, nil)
			page, perPage, offset := pagination(req)
			if page != tt.expectedPage {
				t.Errorf("expected page %d, got %d", tt.expectedPage, page)
			}
			if perPage != tt.expectedPerPage {
				t.Errorf("expected perPage %d, got %d", tt.expectedPerPage, perPage)
			}
			if offset != tt.expectedOffset {
				t.Errorf("expected offset %d, got %d", tt.expectedOffset, offset)
			}
		})
	}
}