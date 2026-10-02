package models

import (
	"time"

	"github.com/google/uuid"
)

// ── User ─────────────────────────────────────────────────────

type User struct {
	ID           uuid.UUID `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// ── Project ──────────────────────────────────────────────────

type Project struct {
	ID              uuid.UUID  `json:"id"`
	Slug            string     `json:"slug"`
	Name            string     `json:"name"`
	Description     string     `json:"description"`
	LongDescription *string    `json:"long_description,omitempty"`
	WhyItExists     *string    `json:"why_it_exists,omitempty"`
	Type            []string   `json:"type"`
	Status          string     `json:"status"`
	Stack           []string   `json:"stack"`
	Topics          []string   `json:"topics"`
	RepoURL         *string    `json:"repo_url,omitempty"`
	Homepage        *string    `json:"homepage,omitempty"`
	CoverPattern    string     `json:"cover_pattern"`
	CoverColor      *string    `json:"cover_color,omitempty"`
	Featured        bool       `json:"featured"`
	SortOrder       int        `json:"sort_order"`
	Stars           int        `json:"stars"`
	LastUpdated     *time.Time `json:"last_updated,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type CreateProjectRequest struct {
	Slug            string   `json:"slug"`
	Name            string   `json:"name"`
	Description     string   `json:"description"`
	LongDescription *string  `json:"long_description,omitempty"`
	WhyItExists     *string  `json:"why_it_exists,omitempty"`
	Type            []string `json:"type"`
	Status          string   `json:"status"`
	Stack           []string `json:"stack"`
	Topics          []string `json:"topics"`
	RepoURL         *string  `json:"repo_url,omitempty"`
	Homepage        *string  `json:"homepage,omitempty"`
	CoverPattern    string   `json:"cover_pattern"`
	CoverColor      *string  `json:"cover_color,omitempty"`
	Featured        bool     `json:"featured"`
	SortOrder       int      `json:"sort_order"`
}

type UpdateProjectRequest = CreateProjectRequest

// ── Post ─────────────────────────────────────────────────────

type Post struct {
	ID        uuid.UUID `json:"id"`
	Slug      string    `json:"slug"`
	Title     string    `json:"title"`
	Excerpt   string    `json:"excerpt"`
	Content   string    `json:"content"`
	Tags      []string  `json:"tags"`
	Author    *string   `json:"author,omitempty"`
	Published bool      `json:"published"`
	Date      string    `json:"date"` // YYYY-MM-DD
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreatePostRequest struct {
	Slug      string   `json:"slug"`
	Title     string   `json:"title"`
	Excerpt   string   `json:"excerpt"`
	Content   string   `json:"content"`
	Tags      []string `json:"tags"`
	Author    *string  `json:"author,omitempty"`
	Published bool     `json:"published"`
	Date      string   `json:"date"`
}

type UpdatePostRequest = CreatePostRequest

// ── Contact ──────────────────────────────────────────────────

type Contact struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Subject   *string   `json:"subject,omitempty"`
	Message   string    `json:"message"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateContactRequest struct {
	Name    string  `json:"name"`
	Email   string  `json:"email"`
	Subject *string `json:"subject,omitempty"`
	Message string  `json:"message"`
}

// ── Subscriber ───────────────────────────────────────────────

type Subscriber struct {
	ID               uuid.UUID  `json:"id"`
	Email            string     `json:"email"`
	UnsubscribeToken string     `json:"-"`
	Confirmed        bool       `json:"confirmed"`
	SubscribedAt     time.Time  `json:"subscribed_at"`
	UnsubscribedAt   *time.Time `json:"unsubscribed_at,omitempty"`
}

type SubscribeRequest struct {
	Email string `json:"email"`
}

type UnsubscribeRequest struct {
	Token string `json:"token"`
}

// ── Generic API response types ───────────────────────────────

type APIError struct {
	Error   string `json:"error"`
	Code    int    `json:"code"`
	Details string `json:"details,omitempty"`
}

type PaginatedResponse[T any] struct {
	Data       []T   `json:"data"`
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	TotalPages int   `json:"total_pages"`
}

type DashboardStats struct {
	TotalProjects    int64 `json:"total_projects"`
	TotalPosts       int64 `json:"total_posts"`
	TotalContacts    int64 `json:"total_contacts"`
	UnreadContacts   int64 `json:"unread_contacts"`
	TotalSubscribers int64 `json:"total_subscribers"`
}
