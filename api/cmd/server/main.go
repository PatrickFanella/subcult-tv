package main

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"

	"github.com/subculture-collective/subcult-tv/api/internal/brevo"
	"github.com/subculture-collective/subcult-tv/api/internal/config"
	"github.com/subculture-collective/subcult-tv/api/internal/database"
	"github.com/subculture-collective/subcult-tv/api/internal/handlers"
	"github.com/subculture-collective/subcult-tv/api/internal/patreon"
	"github.com/subculture-collective/subcult-tv/api/internal/router"
)

func main() {
	// Load .env if present (dev mode)
	_ = godotenv.Load("../.env")
	_ = godotenv.Load(".env")

	slog.Info("starting subcult api server")

	cfg, err := config.Load()
	if err != nil {
		slog.Error("config", "error", err)
		os.Exit(1)
	}

	// ── Database ─────────────────────────────────────────────
	ctx := context.Background()
	pool, err := database.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		slog.Error("database connect", "error", err)
		os.Exit(1)
	}
	defer pool.Close()
	slog.Info("database connected")

	// ── Migrations ───────────────────────────────────────────
	if err := database.Migrate(ctx, pool); err != nil {
		slog.Error("migrations", "error", err)
		os.Exit(1)
	}
	slog.Info("migrations applied")

	// ── Seed admin user if none exists ───────────────────────
	if err := seedAdminUser(ctx, pool); err != nil {
		slog.Warn("seed admin", "error", err)
	}

	// ── Patreon client ──────────────────────────────────────
	var patreonClient *patreon.Client
	if cfg.PatreonToken != "" && cfg.PatreonCampaignID != "" {
		patreonClient = patreon.New(cfg.PatreonToken, cfg.PatreonCampaignID, 10*time.Minute)
		slog.Info("patreon client initialized", "campaign_id", cfg.PatreonCampaignID)
	} else {
		slog.Warn("patreon credentials not set, campaign endpoint will return empty data")
	}

	// ── Email (Brevo) ───────────────────────────────────────
	var mail handlers.Mailer
	if mailClient := brevo.New(cfg.BrevoAPIKey, brevo.Newsletter{
		ListID:      cfg.BrevoNewsletterListID,
		TemplateID:  cfg.BrevoDOITemplateID,
		RedirectURL: cfg.NewsletterConfirmedURL,
	}); mailClient != nil {
		mail = mailClient
		slog.Info("brevo email enabled", "newsletter_double_opt_in", mailClient.NewsletterEnabled())
	} else {
		slog.Warn("BREVO_API_KEY not set, contact notifications and newsletter email are off")
	}
	mailCfg := handlers.MailSettings{
		From:      brevo.Address{Name: cfg.MailFromName, Email: cfg.MailFromEmail},
		ContactTo: brevo.Address{Email: cfg.ContactNotifyEmail},
	}

	// ── Router ───────────────────────────────────────────────
	h := handlers.New(pool, cfg.JWTSecret, patreonClient, mail, mailCfg)
	h.StudioRoot = os.Getenv("STUDIO_ROOT")
	h.StudioStateRoot = os.Getenv("STUDIO_STATE_ROOT")
	r := router.New(cfg, h)

	srv := &http.Server{
		Addr:         net.JoinHostPort(os.Getenv("BIND_HOST"), cfg.Port),
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// ── Graceful shutdown ────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		slog.Info("server listening", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server", "error", err)
			os.Exit(1)
		}
	}()

	<-quit
	slog.Info("shutting down server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("forced shutdown", "error", err)
	}

	slog.Info("server stopped")
}

func seedAdminUser(ctx context.Context, pool *pgxpool.Pool) error {
	var count int64
	if err := pool.QueryRow(ctx, `SELECT COUNT(*) FROM users`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil // already has users
	}

	// Read admin credentials from environment
	adminUser := os.Getenv("ADMIN_USER")
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	adminEmail := os.Getenv("ADMIN_EMAIL")

	if adminUser == "" {
		adminUser = "admin"
	}
	if adminEmail == "" {
		adminEmail = "admin@subcult.tv"
	}
	if adminPassword == "" {
		slog.Warn("ADMIN_PASSWORD not set, skipping admin user seeding")
		return nil
	}

	// Hash password at runtime - never commit password hashes
	hash, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash admin password: %w", err)
	}

	_, err = pool.Exec(ctx,
		`INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
		adminUser, adminEmail, string(hash), "admin",
	)
	if err != nil {
		return fmt.Errorf("seed admin: %w", err)
	}

	slog.Info("seeded admin user from environment", "username", adminUser)
	return nil
}
