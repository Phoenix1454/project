# Course Platform

A full-stack course-selling platform: users browse a curriculum of video courses, pay per course via Stripe, and track their progress through a step-by-step learning path.

> **Note:** the live demo backend is currently offline (Railway trial expired). To redeploy instantly on Render's free tier, click: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy) — or run locally per the instructions below.

## What it does

- **Auth** — JWT-based registration/login (`/auth/register`, `/auth/token`, `/auth/me`)
- **Courses & curriculum** — courses are made up of ordered videos grouped into clusters and difficulty levels, exposed as a learning "path" per course (`/courses`, `/courses/{id}/path`)
- **Payments** — Stripe Checkout integration to purchase individual courses (£2 each), with a webhook to confirm payment and a purchase ledger (`/payment/create-checkout`, `/payment/webhook`, `/payment/purchase-course/{id}`)
- **Progress tracking** — marks videos complete per user (`/progress/complete`)
- **Admin** — seed courses/videos and view a basic dashboard (`/admin/seed-courses`, `/admin/dashboard`)
- **Content ingestion** — a scraper/validator pipeline (`backend/ingestion/`) for pulling in and validating curriculum video metadata (via `yt-dlp`)

## Tech Stack

| Layer | Tools |
|---|---|
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Auth | python-jose (JWT), passlib (argon2) |
| Payments | Stripe |
| Database | PostgreSQL (psycopg2) |
| Frontend | Next.js, React, Tailwind, Framer Motion |
| Deployment | Render (`render.yaml`) / Railway (`railway.json`, `Procfile`) |

## Project Structure

```
backend/
  main.py              FastAPI app and routes
  models.py             SQLAlchemy models (Course, Video, User, Purchase, Progress)
  auth.py               JWT auth helpers
  stripe_handler.py     Checkout + webhook logic
  ingestion/            Scraper + validator for curriculum content
web/
  app/                  Next.js pages (courses, course detail, pricing, profile, admin)
  components/           PathMap, LessonNode, VideoModal
```

## Testing

Unit tests cover password hashing and JWT token creation/validation:

```bash
pytest tests/ -v
```

Tests run automatically on every push via [GitHub Actions](.github/workflows/tests.yml).

## Running locally

### Backend

```bash
pip install -r requirements.txt
cp .env.example .env   # fill in DB url, Stripe keys, JWT secret
uvicorn backend.main:app --reload
```

### Frontend

```bash
cd web
npm install
npm run dev
```
