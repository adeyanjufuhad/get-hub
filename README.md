# GET Hub — OAU 200L Engineering Study Platform

A mobile-first, 3G-friendly study platform built for **200-level engineering students in the Faculty of Technology, Obafemi Awolowo University (OAU), Ile-Ife**, focused on first-semester **GET 205**, **GET 207**, and **GET 209** (aligned to NUC CCMAS 2023).

> **Renaming the platform:** Edit `"appName"` in [`content/courses.json`](content/courses.json) (re-exported as `APP_NAME` in [`frontend/lib/config.ts`](frontend/lib/config.ts)).

---

## Monorepo Structure

```text
/
├── content/                  # Courses manifest, MDX topics, and crisp 2D SVG diagrams
│   ├── courses.json          # Add, remove, or rename courses here
│   └── courses/
│       ├── get-205/          # Fundamentals of Fluid Mechanics
│       ├── get-207/          # Applied Mechanics
│       └── get-209/          # Engineering Mathematics I
├── backend/                  # Go 1.22+ REST API (chi, pgx/v5, sqlc, goose, argon2id, JWT)
│   ├── cmd/api/              # HTTP server entrypoint
│   ├── cmd/seed-admin/       # CLI to create or promote an admin user
│   ├── migrations/           # Goose SQL migrations (schema + original draft seed data)
│   ├── queries/              # SQL definitions for sqlc
│   └── internal/             # config, db/sqlc, auth, access, questions, progress, http, server
├── frontend/                 # Next.js (App Router) + TypeScript strict + Tailwind v4 + KaTeX
└── DESIGN.md                 # Light-mode design tokens & emilkowalski/skills UI rules
```

---

## Prerequisites

- **Go 1.22+**
- **Node.js 20+ / 22+** and `npm`
- A **Neon Postgres** project (create two branches: `dev` and `main`/production; use the **pooled** `-pooler` connection string for `DATABASE_URL`)
- [`goose`](https://github.com/pressly/goose) for migrations (`go install github.com/pressly/goose/v3/cmd/goose@latest`)
- Optional: [`sqlc`](https://sqlc.dev) if you modify SQL queries in `backend/queries/`

---

## Environment Variables

### 1. Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `8080`) | HTTP listen port |
| `APP_ENV` | No (`development`) | `development` or `production` |
| `FRONTEND_URL` | Yes | Allowed CORS origin & Google OAuth post-login redirect (e.g. `http://localhost:3000`) |
| `API_PUBLIC_URL` | Yes | Public API URL used for uploaded image URLs & OAuth callback fallback |
| `DATABASE_URL` | Yes | **Neon pooled** Postgres connection string (`...-pooler....neon.tech/...?sslmode=require`) |
| `JWT_SECRET` | Yes | At least 32 random characters (`openssl rand -base64 48`) |
| `ACCESS_TOKEN_TTL_MINUTES` | No (`15`) | Short-lived JWT access cookie TTL |
| `REFRESH_TOKEN_TTL_DAYS` | No (`30`) | Rotating refresh token cookie TTL |
| `COOKIE_SECURE` | No (`false` in dev) | Set `true` in production (HTTPS) |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth 2.0 Web Client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth 2.0 Web Client Secret |
| `GOOGLE_REDIRECT_URL` | Optional (defaults to `$FRONTEND_URL/api/v1/auth/google/callback`) | Must go through the **frontend** origin and match Google Cloud Console exactly (e.g. `http://localhost:3000/api/v1/auth/google/callback`) |
| `INCLUDE_DRAFT_CONTENT` | No (`true` in dev) | Keeps draft seed topics & questions playable until you publish them in `/admin` |
| `ENFORCE_PAID_GATING` | No (`false`) | Phase 1: `false`. Phase 3: flip to `true` to enforce Paystack subscriptions via `access.CanAccess` |
| `UPLOAD_DIR` | No (`./uploads`) | Directory for admin-uploaded SVG/PNG/WebP question assets |

### 2. Frontend (`frontend/.env.local`)
Copy `frontend/.env.example` to `frontend/.env.local`:

| Variable | Required | Description |
|---|---|---|
| `API_INTERNAL_URL` | Yes | Origin of the Go API used by Next.js `/api/v1/*` rewrites (keeps `httpOnly` auth cookies first-party!) |
| `NEXT_PUBLIC_API_URL` | No (leave empty) | Leave empty to route through Next.js same-origin rewrites; only set if calling the API directly cross-origin |

---

## Running Database Migrations (Neon)

The Neon project is **`get-hub`** (id `young-fog-11740367`, region `aws-eu-west-2`, branch `main`, database `gethub`). Its pooled connection string lives in `backend/.env` (gitignored).

The built-in runner reads `backend/.env` automatically and needs no extra tools:

```bash
cd backend
go run ./cmd/migrate -verify   # apply pending migrations, then print course/topic/question counts
go run ./cmd/migrate -status   # list applied/pending migrations without changing anything
```

`goose` also works (the runner recognises migrations goose already applied):

```bash
cd backend
goose -dir migrations postgres "$DATABASE_URL" up
```

This creates all Phase 1 tables (`users`, `sessions`, `courses`, `topics`, `questions`, `question_options`, `attempts`, `topic_progress`, `mock_exams`, `mock_exam_answers`) and applies migrations (`0003` removes unconfirmed `GET 203` and sets the active courses to):
- `GET 205`, `GET 207`, `GET 209`
- 1 original draft sample topic per course
- 15 original draft practice questions (5 per topic, including SVG diagram-backed questions for `GET 205` and `GET 207`)

To roll back the latest migration:
```bash
goose -dir migrations postgres "$DATABASE_URL" down
```

---

## Running Both Apps Locally

### 1. Start the Go API
```bash
cd backend
# Load .env variables into your shell (PowerShell example):
Get-Content .env | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
  $k, $v = $_ -split '=', 2
  [Environment]::SetEnvironmentVariable($k.Trim(), $v.Trim(), 'Process')
}
go run ./cmd/api
```
Verify health: `curl http://localhost:8080/healthz`

### 2. Start the Next.js Frontend
```bash
cd frontend
npm install
npm run sync:diagrams
npm run dev
```
Open `http://localhost:3000`.

---

## Enabling Google Sign-In

The Google button on `/login` and `/signup` only appears once the API has credentials (`GET /api/v1/auth/providers` reports `google_enabled`).

1. In [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** of type **Web application** (configure the OAuth consent screen first if prompted; scopes needed: `openid`, `email`, `profile`).
2. **Authorized JavaScript origins:** `http://localhost:3000` (plus your production site, e.g. `https://gethub.example.com`).
3. **Authorized redirect URIs:** `http://localhost:3000/api/v1/auth/google/callback` (plus `https://<your-site>/api/v1/auth/google/callback`). Use the *frontend* origin: Next.js proxies `/api/v1/*` to the Go API, so the OAuth state cookie and the auth cookies stay first-party on the site domain.
4. Put the client ID and secret in `backend/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then restart the API.

Flow: `/api/v1/auth/google/start` sets a 10-minute CSRF state cookie and redirects to Google → Google returns to `/api/v1/auth/google/callback` → the API checks the state, requires a verified Google email, signs in the existing Google user, links Google to an existing email/password account with the same email, or creates a new student account, then redirects to `/dashboard`. Failures redirect to `/login?error=<code>`, which shows a readable message.

---

## Creating an Admin User

You never need to touch SQL manually to promote yourself to `admin`:

1. **Promote an existing signed-up account:**
   ```bash
   cd backend
   go run ./cmd/seed-admin -email your-email@oauife.edu.ng
   ```
2. **Or create a brand-new admin account directly:**
   ```bash
   cd backend
   go run ./cmd/seed-admin -email admin@oauife.edu.ng -name "Fuhad Adeyanju" -password "choose-a-strong-password"
   ```

Then log in and open **`/admin`** to create, edit, upload SVGs for, and publish/unpublish questions.

---

## Testing & Verification

```bash
# Backend unit tests (MCQ & numeric tolerance, argon2id/JWT/rate-limit auth, CanAccess & RBAC, zero-leak DTOs)
cd backend
go test -v ./...

# Frontend strict TypeScript check & production build
cd frontend
npm run typecheck
npm run build
```

---

## Content Authoring Guide

### Adding, Renaming, or Removing a Course
1. Update the `courses` array in [`content/courses.json`](content/courses.json).
2. Add a small goose migration inserting/updating the matching row in the `courses` table (matching `slug`).

### Adding a New Topic (MDX + SVG)
1. Create `/content/courses/<course-slug>/topics/<topic-slug>.mdx` with frontmatter:
   ```yaml
   ---
   title: "Buoyancy and Stability"
   order: 2
   topicId: "<uuid-matching-topics-table>"
   courseCode: "GET 205"
   courseSlug: "get-205"
   ccmasRef: "Buoyancy and stability of floating bodies"
   outcomes:
     - "Determine buoyant force and metacentric height for floating bodies"
   status: "draft"
   isFree: true
   ---
   ```
2. Put any custom lightweight SVG diagrams in `/content/courses/<course-slug>/diagrams/*.svg` and run `npm run sync:diagrams` in `/frontend`.
3. Add the matching row to the `topics` table via a goose migration and add the entry to `/content/courses/<course-slug>/course.json`.
4. Use `<DiagramFigure src="..." caption="..." />`, `<StepRevealExample title="..." problem="..." steps={[...]} />`, and `<Callout variant="warning" title="...">...</Callout>` inside your MDX.

### Adding & Publishing Questions
1. Sign in as an `admin` and open **`/admin`**.
2. Click **New question**, select Course, Topic, and Question Type (`MCQ` or `Numeric`).
3. Write prompts and step-by-step solutions with KaTeX (`$inline$` or `$$block$$`), upload crisp SVG/PNG diagrams for the prompt or individual MCQ options, and toggle **Draft ↔ Published** once verified.

---

## Deployment Guide

### Frontend → Vercel (`get-hub`)
1. Import the repo in Vercel and set **Root Directory** to `frontend` with Production Branch `main`.
2. Set `API_INTERNAL_URL` to your deployed Go API origin (e.g. `https://get-hub-api.vercel.app`). Leave `NEXT_PUBLIC_API_URL` empty so `/api/v1/*` proxies as first-party cookies on mobile Safari/Chrome.
3. Deploy!

### Backend Go API → Vercel (`get-hub-api`)
`backend/api/index.go` and `backend/vercel.json` expose the Go API as a Vercel Serverless Function.
1. Connect the `get-hub-api` Vercel project to this GitHub repository with **Root Directory** set to `backend` and Production Branch `main` so backend pushes auto-deploy alongside the frontend.
2. Run any pending Neon migrations (`cd backend && go run ./cmd/migrate`) before pushing schema-dependent API changes.

### Alternative Go API Hosts (Container / WebSockets)
`backend/Dockerfile` builds a tiny static Go binary (`distroless/static`).

| Host | Pros | Trade-offs | Recommendation |
|---|---|---|---|
| **Fly.io** | Runs close to Nigeria (`lhr`/`ams`/`jnb`), zero cold starts, native **WebSocket** support for Phase 2 Study Rooms, tiny Go binary runs happily on 256 MB RAM (~$2–5/mo) | Requires a payment card on file even for low spend; uses `fly.toml` CLI | **Best for production & Phase 2** |
| **Render** | Effortless Git-push Docker deploys, free tier for early demos | Free tier spins down after 15 min idle (30–50s cold start hurts 3G UX); $7/mo Starter removes sleep | **Best zero-cost staging/MVP** |
| **Railway** | Clean dashboard, easy managed Redis add-on when Phase 2 scales WebSockets horizontally | Usage-based Hobby plan ($5/mo credit) is less predictable under spikes | **Great alternative if adding Redis later** |
