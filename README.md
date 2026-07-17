# Sports Booking & Social Matchmaking Platform

A full-stack monorepo platform that streamlines sports venue bookings, manages court schedules, and connects players through social matchmaking. The system features a real-time notification engine, automated booking expiration with distributed Redis locks, an AI-powered court recommendation engine using `pgvector` + cosine similarity, and dual payment integration (Stripe & VNPay).

**Live deployment:** `https://thainvbka.id.vn` — AWS EC2 (`t3.small`) behind Nginx, scaled with 2 backend replicas.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [AI Recommendation System](#ai-recommendation-system)
6. [Prerequisites](#prerequisites)
7. [Local Development Setup](#local-development-setup)
8. [Environment Variables Reference](#environment-variables-reference)
9. [Available Scripts](#available-scripts)
10. [Production Deployment](#production-deployment)
11. [CI/CD Pipeline](#cicd-pipeline)
12. [Troubleshooting Guide](#troubleshooting-guide)
13. [License](#license)

---

## Key Features

- **🏢 Complex & Venue Management** — Multi-sport venue setup with customizable peak/off-peak pricing rules (`PricingRule`), court inventory, photo galleries via Cloudinary, and cached aggregate fields (`min_price`, `max_price`, `avg_rating`, `total_subfields`).
- **📅 Intelligent Booking System** — Single slot and recurring bookings (Weekly/Monthly) with half-hour alignment validation and dynamic conflict checking. Booking slots must be multiples of 30 minutes.
- **⏱️ Active Booking Expiration** — `PENDING` bookings expire after 5 minutes via a `node-cron` job with a distributed Redis lock (`NX` + TTL) to prevent duplicate runs across scaled replicas.
- **🤝 Social Matchmaking** — Booking hosts open their slot for public matchmaking. Players filter by sport type and skill level (`BEGINNER` / `INTERMEDIATE` / `ADVANCED`), request to join, and the host accepts or rejects participants.
- **🤖 AI Field Recommendations** — 8-dimensional `pgvector` embeddings per subfield matched against player taste vectors using cosine similarity, then re-ranked by Gemini AI. Cache backed by Redis (TTL: 6 hours).
- **🔌 Real-Time Sockets** — `Socket.IO` with `@socket.io/redis-adapter` for pub/sub synchronization across multiple backend replicas. Events are routed by `target_role` (PLAYER / OWNER / ADMIN).
- **💳 Dual Payment Integration** — Stripe checkout sessions and VNPay IPN webhooks with idempotent transaction handling and `FOR UPDATE` row-level locking.
- **📦 Booking Add-ons** — Players attach SALE/RENTAL products to bookings. Rental stock is automatically restored by a cron job when session end-time passes.
- **📊 Analytics Dashboards** — Recharts visualizations for revenue, slot occupancy, subfield popularity, and payout batch logs (Owner & Admin panels).
- **💰 Payout System** — `OwnerPayout` records are batched into `PayoutBatch` groups. Admins process payouts via Stripe Connect or manual bank transfer. Platform fee is deducted per transaction.

---

## Tech Stack

### Backend (`apps/backend`)

| Layer | Technology |
| :--- | :--- |
| Runtime | Node.js 22, TypeScript 5.9 |
| Framework | Express.js 5.1 |
| ORM | Prisma ORM 7 (`@prisma/adapter-pg`) |
| Database | PostgreSQL 16 + `pgvector` extension |
| Cache & Locks | Redis 7 (`redis` v5, `@socket.io/redis-adapter`) |
| Real-time | Socket.IO 4.8 |
| Scheduling | `node-cron` 4.2 with distributed Redis locking |
| Payments | Stripe 14, VNPay 2.5 |
| Auth | JWT (`jsonwebtoken`), bcrypt, HTTP-only refresh token cookies |
| Email | Nodemailer (Gmail SMTP) |
| Image Upload | Cloudinary via `multer-storage-cloudinary` |
| AI | `@google/genai` (Gemini) for recommendation re-ranking |
| Validation | Zod 4.4 |

### Frontend (`apps/frontend`)

| Layer | Technology |
| :--- | :--- |
| Framework | React 19.1, TypeScript 5.9 (Vite SPA) |
| Styling | Tailwind CSS v4, Radix UI Primitives |
| State | Zustand 5.0 (with `persist` middleware) |
| API Client | Axios (token-refresh interceptors) |
| WebSocket | `socket.io-client` 4.8 |
| Forms | React Hook Form 7.66 + Zod 4.1 |
| Charts | Recharts 2.15 |
| Date | `date-fns` 4.1, `date-fns-tz` 3.2 |

### Infrastructure

| Component | Technology |
| :--- | :--- |
| Web server / Proxy | Nginx (HTTP/2, SSL termination, reverse proxy) |
| Containerization | Docker & Docker Compose |
| CI/CD | GitHub Actions → Docker Hub → AWS EC2 |
| Cloud | AWS EC2 `t3.small` |
| Log viewer | Dozzle (port 9999, password-protected) |

---

## System Architecture

```
apps/
├── backend/                   # Express API + Cron + Socket
│   ├── src/
│   │   ├── configs/           # dotenv, status codes
│   │   ├── controllers/v1/    # Route handlers (18 modules)
│   │   ├── helpers/           # AI vector builder, normalization
│   │   ├── libs/              # redis.ts, socket.ts, prisma.ts
│   │   ├── middlewares/       # auth, role guard, error handler, rate limit
│   │   ├── routes/v1/         # Express routers (17 route files)
│   │   ├── scripts/           # populate-subfield-embeddings, cache scripts
│   │   ├── services/v1/       # Business logic (18 service files)
│   │   ├── utils/             # Shared helpers
│   │   ├── validations/       # Zod schemas
│   │   └── server.ts          # Entry point: Express + Redis + Socket + Cron
│   └── prisma/
│       ├── schema.prisma      # 20 models, pgvector extension
│       └── seed.ts            # Mock data (complexes, courts, players, owners)
└── frontend/                  # React SPA (Vite)
    └── src/
        ├── components/        # UI widgets (Radix-based)
        ├── constants.ts       # Label/color maps for all enums
        ├── context/           # SidebarConfigProvider
        ├── hooks/             # Custom hooks by role (admin/owner/player)
        ├── layouts/           # AdminLayout, AuthLayout, MainLayout, OwnerLayout
        ├── lib/               # axios.ts (interceptors), utils.ts
        ├── pages/             # Views by role (admin/auth/owner/player/public)
        ├── routes/            # routes.tsx, ProtectedRoute.tsx
        ├── services/          # API service classes (12 modules)
        ├── store/             # Zustand stores (auth, match, notification, theme)
        ├── types/             # TypeScript models (15 type files)
        ├── utils/             # Pure helpers (time, price, booking, search)
        └── validations/       # Zod form schemas

nginx/                         # nginx.conf (prod) + nginx.dev.conf (dev)
docker-compose.yml             # Dev: 2x backend + nginx-dev + frontend + Dozzle
docker-compose.prod.yml        # Prod: 2x backend replicas, frontend (Nginx), Dozzle
.github/workflows/deploy.yml   # CI/CD: Build → Docker Hub → EC2 SSH deploy
```

### Production Dataflow

```
Internet (HTTPS/WSS)
        │
        ▼
  Nginx (port 80/443)          — SSL termination, static SPA serving,
        │                         reverse proxy /api/** and /socket.io/**
        ├─────────────────────┐
        ▼                     ▼
  Backend Replica #1    Backend Replica #2
  (port 3000)           (port 3000)
        │                     │
        ├─────────────────────┤
        ▼                     ▼
  Redis (Pub/Sub Adapter,  PostgreSQL 16
  Distributed Locks,       (pgvector,
  Recommendation Cache)    Prisma ORM)
```

### Local Development Dataflow (Docker Compose)

```
Browser
  ├── port 5173  →  frontend (Vite HMR)
  └── port 3000  →  nginx-dev
                       ├── backend-1 (port 3001, tsx watch)
                       └── backend-2 (port 3002, tsx watch)
                                 ├── postgres-db (port 5432, pgvector/pgvector:pg16)
                                 └── redis       (port 6379, redis:7-alpine)
Dozzle log viewer: port 9999
```

---

## Database Schema

All 20 Prisma models in `apps/backend/prisma/schema.prisma`:

| Model | Purpose |
| :--- | :--- |
| `Account` | Central auth entity (email, password, JWT tokens, verification) |
| `Admin` / `Owner` / `Player` | Role-specific profiles linked to `Account` |
| `RefreshToken` | HTTP-only refresh token storage with expiry & revocation |
| `Complex` | Sports venue with cached aggregate fields (prices, ratings, sport types) |
| `SubField` | Individual court with `vector(8)` embedding for AI recommendations |
| `PricingRule` | Granular peak/off-peak pricing per subfield per day-of-week timeslot |
| `Booking` | Single booking with `expires_at` enforced by cron, linked to Payment |
| `RecurringBooking` | WEEKLY/MONTHLY booking series grouping individual `Booking` records |
| `Payment` | Stripe/VNPay transaction with idempotent `transaction_code` |
| `BookingAddon` | Products attached to a booking (SALE/RENTAL with stock management) |
| `Product` | Venue merchandise (SALE) or equipment rentals (RENTAL) |
| `Match` | Social match opened from a confirmed booking; tracks `slots_needed/filled` |
| `MatchParticipant` | Player join requests (PENDING → ACCEPTED/REJECTED/WITHDRAWN) |
| `Review` | Star rating (1–5) + comment per completed booking, updates cached `avg_rating` |
| `OwnerPayout` | Per-payment payout record with platform fee deduction |
| `PayoutBatch` | Admin-grouped payout batch for bulk processing |
| `Notification` | In-app alerts routed by `target_role` (PLAYER/OWNER/ADMIN) |
| `SocialAccount` | OAuth provider links per account |

**Key design decisions:**
- `SubField.embedding` uses `Unsupported("vector(8)")` — requires raw SQL for cosine similarity queries.
- `Complex` caches `min_price`, `max_price`, `avg_rating`, `total_subfields`, `sport_types` to avoid expensive joins on listing pages.
- `Booking.expires_at` is set at creation; a cron job cancels expired `PENDING` bookings every minute.
- `BookingAddon` stock for `RENTAL` items is restored by a cron job when `end_time` passes (not at cancellation).

---

## AI Recommendation System

The engine builds an **8-dimensional feature vector** per player from their booking history (`vectorBuilder.ts`) and compares it against `SubField.embedding` vectors using **cosine distance** via raw Prisma SQL.

### Vector Dimensions

| Dim | Feature | Range | Logic |
| :---: | :--- | :---: | :--- |
| 0 | Favourite sport type | [0,1] | Indexed by `SportType` enum position |
| 1 | Preferred hour of day | [0,1] | Normalized active booking hours |
| 2 | Weekend ratio | [0,1] | Weekend sessions / total sessions |
| 3 | Price affinity | [0,1] | Avg spend mapped to global min/max stats |
| 4 | District proximity | [0,1] | Mapped location district string |
| 5 | Rating preference | [0,1] | Weighted preferred review rating |
| 6 | Subfield popularity | [0,1] | Booking frequency over last 30 days |
| 7 | Recency decay | [0,1] | Decay factor based on last booking date |

### Similarity Query (raw SQL via Prisma)

```sql
SELECT *,
       1 - ("embedding" <=> $1::vector) AS similarity_score
FROM "SubField"
WHERE "isDelete" = false
  AND "complex_id" NOT IN (<owner_exclusions>)
ORDER BY "embedding" <=> $1::vector
LIMIT 20;
```

Results are then **re-ranked by Gemini AI** (`gemini-2.5-flash-lite`) before being returned to the client. Recommendations are cached per player in Redis with a 6-hour TTL (`RECOMMENDATION_CACHE_TTL=21600`).

**Cold-start threshold:** A player needs at least **3 completed bookings** before a taste vector is generated. Below this threshold, popular courts are returned instead.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+ (v22 recommended — matches production container)
- [Docker](https://www.docker.com/) & Docker Compose v2
- [Git](https://git-scm.com/)

---

## Local Development Setup

Two modes are supported. **Mode B (Hybrid)** is recommended for daily development.

### Mode A — Full Docker (simulates production with 2 backend replicas)

```bash
# 1. Copy environment files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 2. Edit apps/backend/.env — set DB credentials, JWT secrets, Stripe/VNPay keys

# 3. Start all services
docker compose up -d --build

# 4. Initialize database (run from host, connects via mapped port)
cd apps/backend
npx prisma db push
npx tsx prisma/seed.ts
npm run populate:embeddings
```

**Ports after startup:**

| Service | URL |
| :--- | :--- |
| Frontend (Vite HMR) | http://localhost:5173 |
| API / WebSocket gateway (Nginx) | http://localhost:3000 |
| Backend replica 1 (direct) | http://localhost:3001 |
| Backend replica 2 (direct) | http://localhost:3002 |
| Prisma Studio | http://localhost:5555 |
| Dozzle log viewer | http://localhost:9999 |

---

### Mode B — Hybrid: Docker DBs + Host Node Processes (recommended)

```bash
# 1. Start only databases
docker compose up postgres-db redis -d

# 2. Terminal 1: Backend
cd apps/backend
cp .env.example .env          # configure DATABASE_URL, REDIS_URL, secrets
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run populate:embeddings
npm run dev                   # starts on port 3000 with tsx watch

# 3. Terminal 2: Frontend
cd apps/frontend
cp .env.example .env          # VITE_API_URL=http://localhost:3000/api/v1
npm install
npm run dev                   # starts on port 5173
```

> [!TIP]
> In Mode B, frontend calls go directly to the backend without an Nginx intermediary, making it easier to view server logs and set IDE breakpoints.

---

### Post-Seed: Required Cleanup Steps

After running `npx tsx prisma/seed.ts`, always run these to avoid stale data issues:

```bash
# 1. Regenerate AI embeddings (seed bypasses Express hooks)
npm run populate:embeddings

# 2. Refresh complex listing cache
npm run cache:populate
```

---

## Environment Variables Reference

### Root `.env` (Docker Compose service configuration)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `secret` |
| `POSTGRES_DB` | Database name | `sports_db` |
| `POSTGRES_PORT` | Host port mapping | `5432` |
| `REDIS_PORT` | Redis host port | `6379` |
| `SERVER_PORT` | Nginx/API gateway port | `3000` |
| `CLIENT_PORT` | Frontend port | `5173` |
| `DOCKER_USERNAME` | Docker Hub username | `youruser` |
| `BACKEND_IMAGE` | Backend image name | `youruser/sports-booking-backend` |
| `FRONTEND_IMAGE` | Frontend image name | `youruser/sports-booking-frontend` |
| `DOZZLE_USERNAME` | Log viewer username | `admin` |
| `DOZZLE_PASSWORD` | Log viewer password | `strongpassword` |

### `apps/backend/.env`

| Variable | Required | Description |
| :--- | :---: | :--- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection (`redis://localhost:6379`) |
| `SERVER_PORT` | ✅ | Backend listen port (`3000`) |
| `JWT_ACCESS_SECRET` | ✅ | Secret for access token signing |
| `JWT_REFRESH_SECRET` | ✅ | Secret for refresh token signing |
| `JWT_ACCESS_EXPIRATION` | ✅ | Access token TTL (`15m`) |
| `JWT_REFRESH_EXPIRATION` | ✅ | Refresh token TTL (`7d`) |
| `STRIPE_SECRET_KEY` | ✅ | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook signing secret |
| `VNPAY_TMN_CODE` | ✅ | VNPay merchant terminal code |
| `VNPAY_SECURE_SECRET` | ✅ | VNPay secure hash secret |
| `VNPAY_HOST` | ✅ | VNPay endpoint (sandbox or production) |
| `VNPAY_RETURN_URL` | ✅ | Redirect URL after VNPay payment |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `MAIL_HOST` | ✅ | SMTP host (`smtp.gmail.com`) |
| `MAIL_PORT` | ✅ | SMTP port (`587`) |
| `MAIL_USER` | ✅ | Gmail address |
| `MAIL_PASS` | ✅ | Gmail App Password (not account password) |
| `GEMINI_API_KEY` | ✅ | Google AI API key |
| `GEMINI_MODEL` | — | Gemini model ID (`gemini-2.5-flash-lite`) |
| `RECOMMENDATION_CACHE_TTL` | — | Recommendation cache TTL in seconds (`21600`) |
| `CORS_ORIGIN` | — | Allowed CORS origins (comma-separated) |

### `apps/frontend/.env`

| Variable | Required | Description |
| :--- | :---: | :--- |
| `VITE_API_URL` | ✅ | Backend API base URL (`http://localhost:3000/api/v1`) |
| `VITE_SOCKET_URL` | ✅ | Socket.IO origin (`http://localhost:3000`) |

---

## Available Scripts

### Root directory

| Command | Description |
| :--- | :--- |
| `docker compose up -d --build` | Start full dev stack |
| `docker compose down` | Stop stack, preserve volumes |
| `docker compose down -v` | Stop stack, destroy all data |

### Backend (`apps/backend`)

| Command | Description |
| :--- | :--- |
| `npm run dev` | Hot-reload dev server (`tsx watch src/server.ts`) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run start` | Run compiled production server |
| `npm run populate:embeddings` | Compute & store vector embeddings for all subfields (dev) |
| `npm run populate:embeddings:prod` | Same, using compiled JS (production) |
| `npm run cache:populate` | Pre-warm complex listing Redis cache |
| `npm run cache:update` | Update cache entries for changed complexes |
| `npx prisma studio` | Open Prisma GUI at http://localhost:5555 |
| `npx prisma migrate dev` | Create & apply a new migration |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma db push` | Push schema without migration history (dev only) |
| `npx tsx prisma/seed.ts` | Seed mock data |

### Frontend (`apps/frontend`)

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Production Deployment

### Infrastructure Topology

```
Internet (HTTP/HTTPS)
        │
  Port 80 / 443
┌─────────────────────────────────────┐
│     Nginx (frontend container)      │
│  — Serves SPA static files          │
│  — SSL termination (Let's Encrypt)  │
│  — Reverse proxies /api/** & WSS    │
└─────────────┬───────────────────────┘
              │ (ip_hash load balancing)
     ┌────────┴────────┐
     ▼                 ▼
backend-1         backend-2
(port 3000)       (port 3000)
     │                 │
     └────────┬────────┘
              │
    ┌─────────┴──────────┐
    ▼                    ▼
 Redis             PostgreSQL 16
(Auth cache,       (port 5432,
 Socket Pub/Sub,   internal only)
 Rec. cache,
 Dist. locks)
```

### Manual Deploy to EC2 (first time)

```bash
# 1. SSH into EC2
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2_IP>

# 2. Create project directory
mkdir -p ~/sports-booking-platform
cd ~/sports-booking-platform

# 3. Create production env file (never committed to git)
nano .env.production   # fill all variables from .env.example

# 4. Pull and run (images built by CI/CD)
IMAGE_TAG=latest \
BACKEND_IMAGE=youruser/sports-booking-backend \
FRONTEND_IMAGE=youruser/sports-booking-frontend \
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# 5. Run database migrations
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm backend-1 npx prisma migrate deploy

# 6. Seed & populate embeddings (first time only)
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm backend-1 npx prisma db seed
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm backend-1 npm run populate:embeddings:prod
```

### Fast Rollback

```bash
IMAGE_TAG=<previous-git-sha> \
BACKEND_IMAGE=youruser/sports-booking-backend \
FRONTEND_IMAGE=youruser/sports-booking-frontend \
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### Post-Seed Procedure (production)

After seeding or importing a database dump, run all three steps:

```bash
# Step 1: Regenerate vector embeddings
docker compose -f docker-compose.prod.yml --env-file .env.production \
  run --rm backend-1 npm run populate:embeddings:prod

# Step 2: Flush stale Redis cache (old UUIDs cause 404s on homepage)
docker exec -it sports-booking-redis redis-cli -a <REDIS_PASSWORD> flushall

# Step 3: Restart backends
docker compose -f docker-compose.prod.yml --env-file .env.production \
  restart backend-1 backend-2
```

### Operations Quick Reference (EC2)

```bash
# View real-time logs
docker compose -f docker-compose.prod.yml --env-file .env.production \
  logs -f --tail=100 backend-1 backend-2

# Check container health
docker compose -f docker-compose.prod.yml --env-file .env.production ps

# Access PostgreSQL shell
docker exec -it sports-booking-db psql -U <POSTGRES_USER> -d sports_db

# Run migration status check
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec backend-1 npx prisma migrate status

# Free disk space (safe — only removes stopped containers/unused images)
docker system prune -af
```

---

## CI/CD Pipeline

**Trigger:** Push to `main` branch touching `apps/**`, `docker-compose.prod.yml`, `nginx/**`, or `.github/workflows/deploy.yml`.

**Job 1 — Build & Push** (GitHub Actions → Docker Hub):
1. Checkout code
2. Login to Docker Hub
3. Build backend image (multi-stage: `node:22-alpine` builder → lean runner with `dumb-init`)
4. Build frontend image (multi-stage: `node:22-alpine` builder → `nginx:alpine` static server)
5. Push both images tagged `:latest` and `:<git-sha>` (layer cache via registry)

**Job 2 — Deploy to EC2** (SSH via `webfactory/ssh-agent`):
1. Copy `docker-compose.prod.yml` and `nginx/` config to EC2 via `scp`
2. Pull new images on EC2
3. Start `postgres-db` + `redis`, wait for health checks
4. Run `npx prisma migrate deploy` in a temporary container
5. Scale up `backend-1` + `backend-2`, wait for both health checks
6. Force-recreate `frontend` (Nginx) to refresh upstream list
7. Regenerate Dozzle `users.yml` from env vars
8. Start `dozzle` log viewer
9. Run final `curl` health checks on `/api/health` and `/health`
10. Prune Docker images older than 24 hours

**Required GitHub Secrets:**

| Secret | Description |
| :--- | :--- |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password / access token |
| `EC2_HOST` | EC2 public IP or hostname |
| `EC2_SSH_KEY` | SSH private key (`.pem`) |
| `VITE_API_URL` | Frontend build-time API URL |
| `VITE_SOCKET_URL` | Frontend build-time Socket URL |

---

## Troubleshooting Guide

| Symptom | Root Cause | Fix |
| :--- | :--- | :--- |
| Homepage shows 404 for court cards | Redis caches stale UUIDs from previous seed | Run `redis-cli flushall` then restart backends |
| Recommendation API returns popular courts instead | Player has < 3 completed bookings (cold start) | Complete 3+ bookings, then recommendations activate |
| Socket events not delivered across replicas | `REDIS_HOST`/`REDIS_URL` misconfigured | Verify Redis env vars; `@socket.io/redis-adapter` requires a valid connection |
| Emails not sending (535 authentication error) | Gmail App Password expired or revoked | Generate a new App Password at Google Account → Security, update `MAIL_PASS` in `.env.production`, restart backend |
| `DATABASE_URL required during build` | Prisma config failing at compile time | A mock fallback URL is set in `prisma.config.js`; ensure this file is copied in the runner stage |
| `Migrations are pending` | New migration not yet applied in production | Run `npx prisma migrate deploy` inside a container |
| Cron jobs running twice | Multiple replicas firing simultaneously | Expected behavior is prevented — crons use `acquireLock(NX + TTL)`; verify Redis is online |
| `Port 3000/5173 already in use` (local) | Another process using the port | Kill the process or change `SERVER_PORT`/`CLIENT_PORT` in root `.env` |
| Frontend stuck on spinner after login | Refresh token expired, auth store stale | Clear `localStorage.removeItem("accessToken")` and `localStorage.removeItem("auth-storage")`, reload |

---

## License

This project is licensed under the [MIT License](./LICENSE).
