# TaniPintar — dev/run tasks for backend (Flask) + frontend (Vite/React)
# Usage: `make help`

# --- Backend (Python/Flask) ---
VENV       := venv
PY         := $(VENV)/bin/python
PIP        := $(VENV)/bin/pip
BACKEND    := backend
PORT       ?= 8000

# --- Frontend (Node/Vite) ---
# Vite needs Node >= 20; the default shell node may be older, so prefer the
# pinned nvm 20 bin when present and fall back to whatever npm is on PATH.
NODE20     := $(HOME)/.nvm/versions/node/v20.19.5/bin
NPM        := PATH="$(NODE20):$$PATH" npm
FRONTEND   := frontend

.DEFAULT_GOAL := help

.PHONY: help install install-backend install-frontend \
        backend frontend dev build backend-prod lint clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: install-backend install-frontend ## Install all dependencies

install-backend: ## Create venv (if missing) + install backend deps
	@test -d $(VENV) || python3 -m venv $(VENV)
	$(PIP) install -r $(BACKEND)/requirements.txt

install-frontend: ## Install frontend deps
	cd $(FRONTEND) && $(NPM) install

backend: ## Run backend with gunicorn (production)
	cd $(BACKEND) && ../$(VENV)/bin/gunicorn -b 0.0.0.0:$(PORT) run:app

frontend: ## Run frontend (Vite dev server)
	cd $(FRONTEND) && $(NPM) run dev

dev: ## Run backend + frontend together
	$(MAKE) -j2 backend frontend

build: ## Production build of the frontend
	cd $(FRONTEND) && $(NPM) run build

backend-prod: ## Run backend with gunicorn (production)
	cd $(BACKEND) && ../$(VENV)/bin/gunicorn -b 0.0.0.0:$(PORT) run:app

lint: ## Lint the frontend
	cd $(FRONTEND) && $(NPM) run lint

clean: ## Remove build output + Python caches
	rm -rf $(FRONTEND)/dist
	find $(BACKEND) -type d -name __pycache__ -prune -exec rm -rf {} +
