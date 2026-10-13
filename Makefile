# Website, API and Studio development from one checkout.
.DEFAULT_GOAL := help
DEV_PROJECT ?= subcult-dev-$(shell printf '%s' "$(CURDIR)" | sha256sum | cut -c1-10)
DEV_COMPOSE = docker compose --env-file /dev/null -p $(DEV_PROJECT) -f compose.dev.yml

.PHONY: help setup dev dev-up dev-down dev-logs dev-api dev-frontend \
        docker-up docker-down docker-logs docker-rebuild build build-api build-frontend \
        lint typecheck format check check-catalog check-studio check-studio-automation \
        check-library check-import test test-frontend test-api test-studio \
        studio-export studio-export-left-field studio-package studio-preview db-shell clean

help: ## List available commands
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "%-24s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Install locked frontend and Go dependencies
	npm ci
	cd api && go mod download

dev: dev-up ## Start local database/API, then the Vite frontend
	DEV_API_TARGET=http://127.0.0.1:$${DEV_API_PORT:-18085} npm run dev -- --host 127.0.0.1

dev-up: ## Start this checkout's local database and API
	mkdir -p studio/runtime/studio
	$(DEV_COMPOSE) up -d --build --wait

dev-down: ## Stop this checkout's local services, retaining its database
	$(DEV_COMPOSE) down

dev-logs: ## Follow this checkout's local service logs
	$(DEV_COMPOSE) logs -f

dev-api: ## Run the Go API with an explicitly configured database
	cd api && go run ./cmd/server

dev-frontend: ## Run only the loopback Vite frontend
	npm run dev -- --host 127.0.0.1

# Compatibility aliases now use the explicit local development profile.
docker-up: dev-up ## Alias for dev-up
docker-down: dev-down ## Alias for dev-down
docker-logs: dev-logs ## Alias for dev-logs
docker-rebuild: dev-up ## Rebuild this checkout's local API

build: build-api build-frontend ## Build the API and frontend

build-api: ## Build the Go server
	cd api && CGO_ENABLED=0 go build -o server ./cmd/server

build-frontend: ## Typecheck and build public frontend output
	npm run build

lint: ## Lint frontend source
	npm run lint

typecheck: ## Check all TypeScript project references
	npm run typecheck

format: ## Format frontend code and public content
	npm run format

check-catalog: ## Validate the public product catalog
	npm run check:catalog

check: lint typecheck check-catalog check-library check-studio ## Run portable source checks

check-library: ## Validate current production asset manifests and SVGs
	python3 studio/scripts/check_library.py

check-import: ## Verify the immutable original Studio import in Git history
	$(MAKE) -C studio check-import

check-studio: ## Check private exports and posting snapshot redaction
	$(MAKE) -C studio check-studio

check-studio-automation: ## Test preparation jobs with disposable state
	$(MAKE) -C studio check-automation

test: test-frontend test-api test-studio ## Run frontend, API and Studio tests

test-frontend: ## Run frontend regression tests
	npm test

test-api: ## Run Go tests; DB integration requires TEST_DATABASE_URL
	cd api && go test ./...

test-studio: check-studio check-studio-automation ## Run Studio tests

studio-export: ## Export the private bundle and approved public SUBCULT assets
	python3 studio/scripts/export_studio.py --site-root "$(CURDIR)"

studio-export-site-brands: ## Export the selected marks, heroes and social images for the October 12 product pages
	rtk proxy python3 studio/scripts/export_site_brands.py

studio-export-left-field: ## Export approved public Left Field assets
	python3 studio/scripts/export_left_field.py --site-root "$(CURDIR)"

studio-package: ## Create brand ZIPs under ignored studio/runtime/packages
	$(MAKE) -C studio package

studio-preview: ## Preview private Studio source galleries on loopback
	$(MAKE) -C studio preview

db-shell: ## Open this checkout's local development database
	$(DEV_COMPOSE) exec postgres psql -U subcult_dev -d subcult_dev

clean: ## Remove frontend/API build output; retain source, bundles and databases
	rm -rf dist api/server
