# QRA — developer convenience targets (run from the repo root).
# All raw commands are also listed in README.md.

.PHONY: setup setup-backend setup-frontend backend frontend dev \
        test test-backend test-frontend lint typecheck build clean

setup: setup-backend setup-frontend
	@echo "Done. Copy the env files next:"
	@echo "  cp backend/.env.example backend/.env"
	@echo "  cp frontend/.env.example frontend/.env.local"

setup-backend:
	python3 -m venv backend/.venv
	backend/.venv/bin/pip install -r backend/requirements-dev.txt

setup-frontend:
	cd frontend && npm install

backend:
	cd backend && ./.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	cd frontend && npm run dev

dev:
	./scripts/dev.sh

test: test-backend test-frontend

test-backend:
	cd backend && ./.venv/bin/python -m pytest

test-frontend:
	cd frontend && npm test

lint:
	cd frontend && npm run lint

typecheck:
	cd frontend && npm run typecheck

build:
	cd frontend && npm run build

clean:
	rm -rf backend/.venv backend/data backend/uploads frontend/node_modules frontend/.next
