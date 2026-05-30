# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What MTMS Is

MTMS (Mission Task Management System / "MPSE Total Manager System") is a project
and daily-work-report management web app for a CAE team. It is a monorepo:
React + TypeScript frontend, FastAPI + PostgreSQL backend, wired together with
Docker Compose behind an nginx reverse proxy. UI strings and many commit
messages are in Korean.

> Naming note: legacy "LG" naming survives in places — the Postgres database is
> `lgedb`, the frontend package is `lge-frontend`. These are intentional, not bugs.

## Commands

### Full stack (Docker — the normal way to run everything)
```bash
cd docker
docker compose up -d            # build + start db, backend, frontend → http://localhost:3000
docker compose down             # stop (keeps pg_data volume)
docker compose down -v          # stop + wipe database
# dev override: hot-reload backend with source mounted
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```
Ports: frontend (nginx) `3000`, backend `8000`, postgres `5432`.
On `up`, the backend `entrypoint.sh` runs `alembic upgrade head` then seeds data
before starting uvicorn — migrations and seeding are automatic in Docker.

### Backend (local)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000        # note: main:app, not app.main:app
pytest                                        # run all tests (config in pytest.ini)
pytest tests/test_project_schemas.py          # single file
pytest tests/test_report_schemas.py::test_name -q   # single test
alembic upgrade head                          # apply migrations
alembic revision -m "message"                 # new migration in migrations/versions/
```
In Docker, run migrations with `docker exec docker-backend-1 alembic upgrade head`.

### Frontend (local)
```bash
cd frontend
npm install
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # tsc typecheck + vite build
npm run lint       # eslint src --ext ts,tsx
```
There is no frontend test runner configured. Backend tests currently cover only
Pydantic schema validation (`backend/tests/`), not endpoints or repositories.

## Backend Architecture

The directory layout (`domain/`, `application/`, `infrastructure/`, `interfaces/`)
advertises Clean Architecture, but **`domain/` and `application/` are empty
placeholder packages** (only `__init__.py`). Do not put logic there or wire
through use-cases/entities unless you are deliberately introducing that layer.
The actual request flow is two layers:

```
interfaces/api/v1/<resource>.py     # FastAPI router: HTTP, auth, validation, status codes
        │  calls
infrastructure/repositories/<resource>_repo.py   # plain function module (not a class) doing SQLAlchemy queries
        │  operates on
infrastructure/database/models.py   # SQLAlchemy ORM models (single file, all tables)
```

Conventions that hold across resources:
- **Repositories are modules of functions**, imported as `from app.infrastructure.repositories import project_repo` and called `project_repo.get_all(db)`. They take a `Session` and commit themselves. No repository classes, no DI container.
- **Routers** declare `router = APIRouter(prefix="/<resource>", tags=[...])`, depend on `get_db` and `get_current_user`, and raise `HTTPException` for 404/403/409. Business rules (ownership, state guards) live as small `_helper()` functions in the router file (see `reports.py`).
- **Pydantic schemas** live in `interfaces/schemas/<resource>.py` (`...Create`, `...Update`, `...Out`). `Out` schemas are returned via `response_model=`.
- **Every endpoint requires auth** via `_: User = Depends(get_current_user)` except `/health` and the `/auth/login*` routes.
- Registering a new resource = create router + schemas + repo, then add `router.include_router(<resource>.router)` in `interfaces/api/v1/__init__.py`. The whole API mounts under `/api/v1` in `main.py`.

Auth: `core/security.py` issues/decodes JWTs (HS256, 8h expiry); `core/deps.get_current_user` decodes the bearer token and loads the `User`. Two login endpoints exist — `POST /auth/login` (OAuth2 form) and `POST /auth/login/json` (JSON body); the frontend uses `/login/json`. Settings come from `core/config.py` via pydantic-settings / env vars (`DATABASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_HOURS`, `DEBUG`).

### Report workflow (the one real state machine)
Daily reports move through `draft → submitted → approved | rejected`, with
`rejected` reports becoming editable again. Rules enforced in
`reports.py` / `report_repo.py`:
- Only `draft` or `rejected` reports can be edited/deleted/submitted.
- Only the **author** (matched by `author_email`) can edit/delete/submit.
- Only `submitted` reports can be approved/rejected, and an author **cannot
  approve or reject their own** report.
When changing report behavior, keep these guards consistent across the router and
repository, and reflect transitions in `submitted_at` / `reviewed_at` / `review_comment`.

### Database & migrations
- Models in `infrastructure/database/models.py`; UUID primary keys, timezone-aware
  timestamps. `projects` has `CheckConstraint`s for `progress` (0–100) and an
  allowed `status` set — keep DB constraints, the model, and Pydantic schemas in agreement.
- Schema changes require **both** a model edit and an Alembic migration in
  `backend/migrations/versions/` (numbered `001_`, `002_`, …). `db/init/01_init.sql`
  only bootstraps the empty database on first container start; it is not the schema source of truth.
- Seed data (users with password `password`, sample projects, etc.) is in
  `infrastructure/database/seed.py`, run idempotently on startup.

## Frontend Architecture

A faux "desktop OS" SPA, not page-routed. `App.tsx` gates on a stored user:
unauthenticated → `LoginPage`, otherwise → `DesktopShell`.

- **`DesktopShell`** is the window manager: a `Sidebar` of app icons + a tabbed
  `BrowserWindow`. Opening an app pushes a tab; Dashboard opens by default.
- **App registry** (`apps/registry.tsx`) maps each `AppId` to a title, fake URL,
  and the rendered component. The eight apps live in `src/apps/` (`DashboardApp`,
  `ProjectsApp`, `ReportsApp`, `ScheduleApp`, `InboxApp`, `TeamApp`, `FilesApp`,
  `SettingsApp`). **To add a feature app:** create `src/apps/<Name>App.tsx` and add
  one entry to `APP_REGISTRY` — that is the whole wiring.
- **API layer** (`services/api.ts`) is a single axios instance with `baseURL:
  '/api/v1'` and a request interceptor that attaches the bearer token. Per-resource
  call objects (`projectsApi`, `reportsApi`, …) are the only place that talks HTTP —
  components consume those, not axios directly. Tokens/user persist in
  `localStorage` or `sessionStorage` (keyed `mtms_token` / `mtms_user`) depending on
  the "remember me" choice.
- **Types** (`src/types.ts`) mirror backend Pydantic schemas; keep them in sync when
  changing API shapes.
- Reusable primitives live in `components/ui/` (`Section`, `Bar`, `Tag`,
  `AsyncState`) and chrome in `components/layout/`. Styling is largely inline styles
  plus `styles/globals.css`; there is no CSS framework.
- In production the nginx container serves the built SPA and reverse-proxies
  `/api/` and `/health` to the backend (`frontend/nginx.conf`), so the frontend
  never needs an absolute backend URL.

## Other directories
- `design/` — standalone HTML/JSX visual prototypes (not imported by the app).
- `task.md`, `prjectUpdate.json` — planning / changelog notes, not code.
- `AGENTS.md` is currently byte-identical to the behavioral-guidelines section
  below; if you update those guidelines, update both files.

---

# Behavioral Guidelines

Guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
