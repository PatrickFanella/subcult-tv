package router

import (
	"net/http"
	"regexp"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/subculture-collective/subcult-tv/api/internal/config"
	"github.com/subculture-collective/subcult-tv/api/internal/handlers"
	"github.com/subculture-collective/subcult-tv/api/internal/middleware"
)

// Rate limit thresholds (requests per window).
const (
	GeneralRateLimit     = 100
	LoginRateLimit       = 5
	FormRateLimit        = 10
	StudioAssetRateLimit = 500
	RateLimitWindow      = time.Minute
)

var studioAssetPath = regexp.MustCompile(`^/api/v1/admin/studio/(assets|posting-media)/[a-f0-9]{64}$`)

// cspConnectOrigins returns origins permitted for browser connect-src requests:
// the configured CORS origins (API calls) plus a self-hosted Umami when set.
func cspConnectOrigins(cfg *config.Config) []string {
	origins := append([]string{}, cfg.CORSOrigins...)
	if cfg.UmamiURL != "" {
		origins = append(origins, cfg.UmamiURL)
	}
	return origins
}

// New creates a configured Chi router with all API routes.
func New(cfg *config.Config, h *handlers.Handler) *chi.Mux {
	r := chi.NewRouter()

	// Rate limiters for different endpoint types
	generalLimiter := middleware.NewRateLimiter(GeneralRateLimit, RateLimitWindow)
	loginLimiter := middleware.NewRateLimiter(LoginRateLimit, RateLimitWindow)
	publicFormLimiter := middleware.NewRateLimiter(FormRateLimit, RateLimitWindow)
	studioAssetLimiter := middleware.NewRateLimiter(StudioAssetRateLimit, RateLimitWindow)

	// ── Global middleware ────────────────────────────────────
	r.Use(chimw.RealIP)
	r.Use(chimw.RequestID)
	r.Use(middleware.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Compress(5))
	r.Use(middleware.SecurityHeaders(cspConnectOrigins(cfg)))
	r.Use(middleware.LimitBody)
	// Gallery assets have a separate bounded budget so thumbnails cannot block
	// search, session checks or login. The protected route still requires Auth.
	r.Use(func(next http.Handler) http.Handler {
		general := middleware.RateLimit(generalLimiter)(next)
		assets := middleware.RateLimit(studioAssetLimiter)(next)
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			if req.Method == http.MethodGet && studioAssetPath.MatchString(req.URL.Path) {
				assets.ServeHTTP(w, req)
				return
			}
			general.ServeHTTP(w, req)
		})
	})

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// ── Metrics ──────────────────────────────────────────────
	r.Handle("/metrics", promhttp.Handler())

	// ── Health ───────────────────────────────────────────────
	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"subcult-api"}`))
	})

	// ── API v1 ───────────────────────────────────────────────
	r.Route("/api/v1", func(api chi.Router) {

		// Public routes with stricter rate limiting for sensitive endpoints
		api.With(middleware.RateLimit(loginLimiter)).Post("/auth/login", h.Login)

		api.Get("/catalog/projects", h.PublishedProjects)

		api.Get("/projects", h.PublishedProjects)
		api.Get("/projects/{slug}", h.PublishedProject)

		api.Get("/posts", h.ListPosts)
		api.Get("/posts/{slug}", h.GetPost)

		api.With(middleware.RateLimit(publicFormLimiter)).Post("/contacts", h.SubmitContact)

		api.Get("/patreon/campaign", h.GetPatreonCampaign)
		api.Post("/webhooks/brevo", h.BrevoNewsletterWebhook)

		api.Get("/stats", h.Stats)
		api.Post("/posting-preparation", h.IngestPublications)
		api.Post("/posting-preparation/rerolls/claim", h.ClaimRerolls)
		api.Post("/posting-preparation/rerolls/{id}", h.FinishReroll)
		api.Get("/posting-media/{id}", h.PostingMedia)

		api.With(middleware.RateLimit(publicFormLimiter)).Post("/newsletter/subscribe", h.Subscribe)
		api.With(middleware.RateLimit(publicFormLimiter)).Post("/newsletter/unsubscribe", h.Unsubscribe)

		// ── Protected (admin) routes ────────────────────────
		api.Group(func(admin chi.Router) {
			admin.Use(middleware.Auth(cfg.JWTSecret, h.TokenRevoked))

			admin.Get("/auth/me", h.Me)
			admin.Post("/auth/logout", h.Logout)

			// Admin dashboard
			admin.Get("/admin/stats", h.DashboardStats)
			admin.Get("/admin/studio", h.StudioCatalog)
			admin.Get("/admin/studio/jobs", h.StudioJobs)
			admin.Get("/admin/studio/posting", h.PostingDashboard)
			admin.Get("/admin/studio/review", h.ReviewDrafts)
			admin.Get("/admin/studio/posting-media/{sha256}", h.PostingPreparedMedia)
			admin.Put("/admin/studio/review/{id}", h.SaveReviewDraft)
			admin.Get("/admin/studio/review/{id}/media", h.ReviewDraftMedia)
			admin.Post("/admin/studio/review/{id}/approve", h.ApproveReviewDraft)
			admin.Post("/admin/studio/review/{id}/decision", h.RecordDraftDecision)
			admin.Put("/admin/studio/review/{id}/schedule", h.EditScheduledDraft)
			admin.Post("/admin/studio/review/{id}/reroll", h.RequestReroll)
			admin.Get("/admin/studio/rerolls", h.Rerolls)
			admin.Get("/admin/studio/decisions", h.DraftDecisions)
			admin.Get("/admin/studio/delivery", h.SocialDelivery)
			admin.Post("/admin/studio/delivery", h.ApproveSchedule)
			admin.Get("/admin/studio/assets/{id}", h.StudioAsset)
			admin.Get("/admin/studio/references", h.ListStudioReferences)
			admin.Get("/admin/studio/references/facets", h.StudioReferenceFacets)
			admin.Get("/admin/studio/references/{id}", h.GetStudioReference)

			admin.Post("/admin/projects/{id}/approve", h.ApproveProject)
			admin.Delete("/admin/projects/{id}/publication", h.UnpublishProject)

			admin.Get("/admin/projects", h.ListProjects)

			// Projects CRUD
			admin.Post("/projects", h.CreateProject)
			admin.Put("/projects/{id}", h.UpdateProject)
			admin.Delete("/projects/{id}", h.DeleteProject)

			admin.Get("/admin/posts", h.ListAllPosts)
			admin.Get("/admin/publications", h.Publications)
			admin.Put("/admin/publications/{id}", h.SavePublication)
			admin.Post("/admin/publications/{id}/approve", h.ApprovePublication)
			// Posts CRUD
			admin.Post("/posts", h.CreatePost)
			admin.Put("/posts/{id}", h.UpdatePost)
			admin.Delete("/posts/{id}", h.DeletePost)

			// Contacts management
			admin.Get("/contacts", h.ListContacts)
			admin.Patch("/contacts/{id}/read", h.MarkContactRead)
			admin.Delete("/contacts/{id}", h.DeleteContact)

			// Newsletter management
			admin.Get("/newsletter/subscribers", h.ListSubscribers)
		})
	})

	return r
}
