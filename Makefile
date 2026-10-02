# ═══════════════════════════════════════════════════════════
# SUBCULT — subcult.tv
# ═══════════════════════════════════════════════════════════

.PHONY: help dev dev-api dev-frontend build build-api build-frontend \
        docker-up docker-down docker-logs docker-rebuild \
        lint typecheck format check test clean setup db-shell db-reset

# Default target
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Setup ─────────────────────────────────────────────────

setup: ## Install all dependencies (frontend + Go)
	npm install
	cd api && go mod download
	@echo ""
	@echo "✓ Dependencies installed."
	@echo "  Copy .env.example → .env and fill in values."

# ── Development ───────────────────────────────────────────

dev: ## Run everything (Docker services + Vite dev server)
	$(MAKE) docker-up
	@sleep 2
	$(MAKE) dev-frontend

dev-frontend: ## Start Vite dev server only
	npx vite --host

dev-api: ## Start Go API server locally (no Docker)
	cd api && go run ./cmd/server

# ── Docker ────────────────────────────────────────────────

docker-up: ## Start all Docker services (postgres, api, umami)
	docker compose up -d

docker-down: ## Stop all Docker services
	docker compose down

docker-logs: ## Tail Docker logs
	docker compose logs -f

docker-rebuild: ## Rebuild and restart Docker services
	docker compose up -d --build

# ── Build ─────────────────────────────────────────────────

build: build-api build-frontend ## Build everything for production

build-frontend: ## Build frontend for production
	npx vite build

build-api: ## Build Go API binary
	cd api && CGO_ENABLED=0 go build -o server ./cmd/server

# ── Quality ───────────────────────────────────────────────

lint: ## Run ESLint on frontend
	npx eslint src/

typecheck: ## Run TypeScript type checking
	npx tsc -b

format: ## Format code with Prettier
	npx prettier --write "src/**/*.{ts,tsx,css}" "content/**/*.mdx"

check: lint typecheck ## Run all quality checks
	@echo "✓ All checks passed."

test: ## Run tests (Go backend)
	cd api && go test ./...

# ── Database ──────────────────────────────────────────────

db-shell: ## Open psql shell to the database
	docker compose exec postgres psql -U subcult -d subcult_db

db-reset: ## Drop and recreate the database (data loss!)
	docker compose down -v
	docker compose up -d postgres
	@echo "Database reset. Run 'make docker-up' to restart services."

# ── Cleanup ───────────────────────────────────────────────

clean: ## Remove build artifacts
	rm -rf dist api/server
	@echo "✓ Clean."

# Studio production sources share this repository; runtime activation is separate.
.PHONY: check-studio check-studio-automation studio-export studio-export-left-field

check-studio: ## Check private exports, source hashes and snapshot redaction
	$(MAKE) -C studio check-studio

check-studio-automation: ## Test preparation jobs with disposable state
	$(MAKE) -C studio check-automation

studio-export: ## Export the private bundle and approved public SUBCULT assets
	python3 studio/scripts/export_studio.py --site-root "$(CURDIR)"

studio-export-left-field: ## Export approved public Left Field assets
	python3 studio/scripts/export_left_field.py --site-root "$(CURDIR)"
