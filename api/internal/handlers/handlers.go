package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"math"
	"net/http"
	"strconv"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/subculture-collective/subcult-tv/api/internal/brevo"
	"github.com/subculture-collective/subcult-tv/api/internal/patreon"

	"github.com/subculture-collective/subcult-tv/api/internal/postybirb"
)

// Mailer sends email and manages newsletter consent. *brevo.Client
// implements it; a nil Mailer disables email.
type Mailer interface {
	SendEmail(ctx context.Context, e brevo.Email) error
	NewsletterEnabled() bool
	RequestDoubleOptIn(ctx context.Context, email string) error
	RemoveFromNewsletter(ctx context.Context, email string) error
	NewsletterMembers(ctx context.Context) ([]string, error)
}

// MailSettings are the addresses used for site email.
type MailSettings struct {
	From      brevo.Address
	ContactTo brevo.Address
}

// Handler bundles dependencies for all HTTP handlers.
type Handler struct {
	BufferPosting             BufferProvider
	BufferChannels            []string
	PostingPreparationKey     string
	DevelopmentAutoPublish    bool
	PatreonPosting            *postybirb.Client
	PatreonSchedulingVerified bool
	SocialPosting             *postybirb.Client
	SocialAccounts            []string
	BlueskyAccounts           map[string]string
	PostingMediaBaseURL       string
	BrevoWebhookSecret        string
	BrevoNewsletterListID     int64
	StudioRoot                string
	StudioStateRoot           string
	DB                        *pgxpool.Pool
	JWTSecret                 string
	Patreon                   *patreon.Client
	Mail                      Mailer
	MailCfg                   MailSettings

	// logoutBefore tracks server-side logout cut-offs per user (userID → iat epoch).
	// Tokens issued before the cut-off are rejected by TokenRevoked.
	logoutBefore sync.Map
}

// Pagination defaults.
const (
	DefaultPerPage = 20
	MaxPerPage     = 100
	MaxPage        = 100000
)

// New creates a new Handler.
func New(db *pgxpool.Pool, jwtSecret string, patreonClient *patreon.Client, mail Mailer, mailCfg MailSettings) *Handler {
	return &Handler{DB: db, JWTSecret: jwtSecret, Patreon: patreonClient, Mail: mail, MailCfg: mailCfg}
}

// TokenRevoked reports whether a token issued at iat for userID was issued at
// or before the user's server-side logout cut-off. Tokens issued in the same
// second as the logout are revoked too; Login deletes the cut-off before it
// issues a token, so a fresh login in that second stays valid. A zero iat
// (absent claim) is never treated as revoked.
func (h *Handler) TokenRevoked(userID string, iat int64) bool {
	if iat == 0 {
		return false
	}
	if v, ok := h.logoutBefore.Load(userID); ok {
		return iat <= v.(int64)
	}
	return false
}

// ── Helpers ──────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]interface{}{
		"error": msg,
		"code":  status,
	})
}

// writeDBError maps a database error to a client response without exposing
// the driver message. The real error is logged.
func writeDBError(w http.ResponseWriter, err error, notFoundMsg string) {
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, http.StatusNotFound, notFoundMsg)
		return
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505": // unique_violation
			writeError(w, http.StatusConflict, "A record with that identifier already exists")
			return
		case "22P02": // invalid_text_representation (bad UUID, enum, number)
			writeError(w, http.StatusBadRequest, "A field has an invalid format")
			return
		case "22007", "22008": // invalid_datetime_format, datetime_field_overflow
			writeError(w, http.StatusBadRequest, "A date field is invalid")
			return
		case "22001": // string_data_right_truncation
			writeError(w, http.StatusBadRequest, "A field is too long")
			return
		}
	}
	slog.Error("database write failed", "error", err)
	writeError(w, http.StatusInternalServerError, "The change could not be saved")
}

func pagination(r *http.Request) (page, perPage int, offset int) {
	page, _ = strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	if page > MaxPage {
		page = MaxPage
	}
	perPage, _ = strconv.Atoi(r.URL.Query().Get("per_page"))
	if perPage < 1 || perPage > MaxPerPage {
		perPage = DefaultPerPage
	}
	// page and perPage are both bounded, so this cannot overflow or go negative.
	offset = (page - 1) * perPage
	if offset < 0 {
		offset = 0
	}
	return
}

func totalPages(total int64, perPage int) int {
	return int(math.Ceil(float64(total) / float64(perPage)))
}
