package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config holds all application configuration.
type Config struct {
	Port              string
	DatabaseURL       string
	JWTSecret         string
	CORSOrigins       []string
	UmamiURL          string
	PatreonToken      string
	PatreonCampaignID string

	// Brevo email. Without BREVO_API_KEY no email is sent.
	BrevoWebhookSecret     string
	BrevoAPIKey            string
	BrevoNewsletterListID  int64
	BrevoDOITemplateID     int64
	NewsletterConfirmedURL string
	MailFromName           string
	MailFromEmail          string
	ContactNotifyEmail     string
}

// Load reads configuration from environment variables.
func Load() (*Config, error) {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	corsRaw := os.Getenv("CORS_ORIGINS")
	var origins []string
	if corsRaw != "" {
		origins = strings.Split(corsRaw, ",")
		for i := range origins {
			origins[i] = strings.TrimSpace(origins[i])
		}
	} else {
		origins = []string{"http://localhost:5175"}
	}

	return &Config{
		Port:              port,
		DatabaseURL:       dbURL,
		JWTSecret:         jwtSecret,
		CORSOrigins:       origins,
		UmamiURL:          os.Getenv("UMAMI_URL"),
		PatreonToken:      os.Getenv("PATREON_TOKEN"),
		PatreonCampaignID: os.Getenv("PATREON_CAMPAIGN_ID"),

		BrevoWebhookSecret:     os.Getenv("BREVO_WEBHOOK_SECRET"),
		BrevoAPIKey:            os.Getenv("BREVO_API_KEY"),
		BrevoNewsletterListID:  envInt("BREVO_NEWSLETTER_LIST_ID"),
		BrevoDOITemplateID:     envInt("BREVO_DOI_TEMPLATE_ID"),
		NewsletterConfirmedURL: envOr("NEWSLETTER_CONFIRMED_URL", "https://subcult.tv/newsletter/confirmed"),
		MailFromName:           envOr("MAIL_FROM_NAME", "SUBCULT.TV"),
		MailFromEmail:          envOr("MAIL_FROM_EMAIL", "noreply@subcult.tv"),
		ContactNotifyEmail:     envOr("CONTACT_NOTIFY_EMAIL", "info@subcult.tv"),
	}, nil
}

func envOr(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

// envInt returns 0 when the variable is unset or not a number.
func envInt(key string) int64 {
	n, _ := strconv.ParseInt(strings.TrimSpace(os.Getenv(key)), 10, 64)
	return n
}
