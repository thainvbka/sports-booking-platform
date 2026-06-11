# Sports Booking & Social Matchmaking Platform

A high-performance, scalable monorepo platform designed to streamline sports venue bookings, manage complex schedules, and connect players via social matchmaking. The system features a real-time notification engine, automated booking timeouts with intelligent grace periods, and an AI-powered field recommendation engine utilizing `pgvector` and cosine similarity.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [AI Recommendation System](#ai-recommendation-system)
5. [Prerequisites](#prerequisites)
6. [Local Development Setup](#local-development-setup)
7. [Database & Migrations](#database--migrations)
8. [Production Deployment & Scaling](#production-deployment--scaling)
9. [Available Scripts Reference](#available-scripts-reference)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [License](#license)

---

## Key Features

*   **🏢 Complex & Venue Management**: Multi-sport venue setup with customizable peak/off-peak pricing rules, court inventory, and photo galleries via Cloudinary.
*   **📅 Intelligent Booking System**: Supports single slot and recurring bookings (Weekly/Monthly) with dynamic conflict checking.
*   **⏱️ Active Booking Expiration**: Enforces a 5-minute checkout window with a 1-minute fallback grace period for Stripe/VNPay cancellations.
*   **🤝 Social Matchmaking**: Allows booking hosts to open their slot for public matchmaking, enabling other players with matching skill levels to request to join.
*   **🤖 AI Field Recommendations**: Builds player taste vectors to recommend courts using an 8-dimensional space matching against `pgvector` with Cosine Distance.
*   **🔌 Real-Time Sockets**: Scaled WebSocket events sync across multiple backend nodes using Redis Pub/Sub adapters.
*   **💳 Dual Payment Integration**: Secure checkouts using VNPay (IPN/secure hash) and Stripe checkout portals.
*   **📊 Admin & Owner Dashboards**: Real-time analytical charts (Recharts) detailing revenues, slot occupancy, subfield popularity, and payout batching logs.

---

## Technology Stack

### Backend Core
*   **Runtime & Language**: Node.js, TypeScript
*   **Framework**: Express.js
*   **Database ORM**: Prisma ORM v7
*   **Caching & Queue**: Redis (Distributed locks & Socket.IO cluster synchronization)
*   **Real-time**: Socket.IO
*   **Scheduling**: Node-Cron (with distributed locking)

### Frontend Core
*   **Framework**: React 19 (Vite SPA template)
*   **Styling**: Tailwind CSS v4
*   **UI Components**: Radix UI Primitives (styled for dark mode aesthetics)
*   **State Management**: Zustand
*   **Analytics**: Recharts
*   **API Client**: Axios

### Infrastructure & Operations
*   **Database Engine**: PostgreSQL 16 with `pgvector` extension
*   **Web Server / Proxy**: Nginx (HTTP/2, SSL termination)
*   **Containerization**: Docker & Docker Compose
*   **CI/CD**: GitHub Actions
*   **Cloud Hosting**: AWS EC2 (`t3.small`)

---

## System Architecture

The platform is organized as a monorepo containing `/apps/backend` and `/apps/frontend`. 

### Monorepo Structure
```text
├── apps/
│   ├── backend/               # Express API, Prisma Schemas, and Cron tasks
│   │   ├── src/
│   │   │   ├── controllers/   # Route handlers
│   │   │   ├── helpers/       # AI Vector builder, normalization
│   │   │   ├── libs/          # Redis and Socket instances
│   │   │   ├── middlewares/   # Auth, role check, error handler
│   │   │   ├── routes/        # Express routers (v1)
│   │   │   └── services/      # Business logic (Stripe, VNPay, Cron, Payouts)
│   │   ├── prisma/            # DB schema.prisma & seed data
│   │   └── Dockerfile         # Production multi-stage Docker build
│   └── frontend/              # React SPA
│       ├── src/
│       │   ├── components/    # Reusable UI widgets
│       │   ├── hooks/         # Custom React hooks
│       │   ├── layouts/       # Main, Owner, Admin layouts
│       │   ├── pages/         # View templates
│       │   └── store/         # Zustand global stores
│       └── Dockerfile         # Nginx static-content server
├── nginx/                     # Production reverse proxy config
├── docker-compose.yml         # Development configuration
└── docker-compose.prod.yml    # Production scaling configuration
```

### High Availability Production Dataflow

```mermaid
graph TD
    Client[Web Browser / Client] -->|HTTPS / WSS| Nginx[Nginx Load Balancer]
    Nginx -->|Reverse Proxy / HTTP| Backend1[Backend Replica 1]
    Nginx -->|Reverse Proxy / HTTP| Backend2[Backend Replica 2]
    
    Backend1 <-->|Redis Pub/Sub Socket Adapter| Redis[(Redis Cache & Locks)]
    Backend2 <-->|Redis Pub/Sub Socket Adapter| Redis
    
    Backend1 -->|SQL Queries| DB[(PostgreSQL + pgvector)]
    Backend2 -->|SQL Queries| DB
```

---

## AI Recommendation System

The recommendation engine matches player booking history against available sports courts (Subfields) using **8-dimensional feature vectors** computed by `vectorBuilder.ts`.

### Vector Dimensions

| Dimension | Feature Name | Range | Normalization Logic |
| :--- | :--- | :--- | :--- |
| **0** | Favorite Sport | `[0.0, 1.0]` | Indexed by `SportType` (Football, Basketball, Badminton, etc.) |
| **1** | Preferred Hour | `[0.0, 1.0]` | Normalized active hours (early morning vs peak evening slots) |
| **2** | Weekend Ratio | `[0.0, 1.0]` | Count of weekend sessions vs weekday sessions |
| **3** | Pricing Affinity | `[0.0, 1.0]` | User's average spend mapped against global min/max price stats |
| **4** | District Proximity | `[0.0, 1.0]` | Mapped location district string (e.g., Cau Giay, Hoan Kiem) |
| **5** | Rating Preference | `[0.0, 1.0]` | Preferred review rating score of courts |
| **6** | Popularity | `[0.0, 1.0]` | Subfield booking frequency over the last 30 days |
| **7** | Recency | `[0.0, 1.0]` | Recency decay indicator based on player's last booking date |

### Similarity Matching Query

Prisma schema utilizes `Unsupported("vector(8)")` on `SubField`. The recommendation service executes a raw SQL query calculating cosine similarity to suggest the top 20 subfields:

```sql
SELECT *, 
       1 - ("embedding" <=> $1::vector) AS similarity_score
FROM "SubField"
WHERE "isDelete" = false AND "complex_id" NOT IN (EXCLUDES)
ORDER BY "embedding" <=> $1::vector
LIMIT 20;
```

---

## Prerequisites

Before setting up locally, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) v20.x or higher
*   [Docker](https://www.docker.com/) & Docker Compose
*   [Git](https://git-scm.com/)

---

## Local Development Setup

### 1. Environment Configurations

Copy the example environment files for both apps and customize them:

**For Root directory (Docker databases):**
```bash
cp .env.example .env
```

**For Backend App:**
```bash
cp apps/backend/.env.example apps/backend/.env
```

**For Frontend App:**
```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Key environment parameters to customize in `apps/backend/.env`:
*   `DATABASE_URL`: Set to `postgresql://thainvbka:thainvbka@localhost:5432/sports_db?schema=public` (matches docker db credentials)
*   `REDIS_URL`: `redis://localhost:6379`
*   `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`: Your Stripe API test keys
*   `VNPAY_TMN_CODE` & `VNPAY_SECURE_SECRET`: Your VNPay sandbox credentials
*   `GEMINI_API_KEY`: Your Google GenAI API developer key

---

### 2. Launching Services via Docker (Recommended)

You can launch the entire stack (Postgres, Redis, Backend, Frontend) with a single command:

```bash
docker compose up --build
```

*   **Backend API** is exposed on: `http://localhost:3000`
*   **Frontend SPA** is exposed on: `http://localhost:5173`
*   **Prisma Studio** is exposed on: `http://localhost:5555`

---

### 3. Manual Local Setup (Alternative)

If you prefer to run databases in Docker but run backend/frontend node processes directly on your host machine:

#### Step A: Start Databases Only
```bash
docker compose up -d postgres-db redis
```

#### Step B: Install Dependencies & Start Backend
```bash
cd apps/backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### Step C: Install Dependencies & Start Frontend
```bash
cd apps/frontend
npm install
npm run dev
```

---

## Database & Migrations

Prisma handles the schema, generation of type-safe client, and migrations.

### Initializing and Seeding Database
If starting with an empty database, you must run migrations and seed mock complexes, players, owners, pricing rules, and products:

```bash
cd apps/backend

# Apply migration schemas
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Populate Mock Data Seeds (Includes complexes, courts, players)
npx prisma db seed

# (Optional) Generate vector embeddings for seeded courts
npm run populate:embeddings
```

---

## Production Deployment & Scaling

The project is configured for automated Git-driven continuous deployment using **GitHub Actions** onto an **AWS EC2** instance via docker compose scaling.

### Production Infrastructure Topology

```text
               [ Internet HTTP / HTTPS ]
                           │
                           ▼
                  [ Port 80 / 443 ]
             ┌──────────────────────────┐
             │    Nginx (Web Proxy)     │
             └─────────────┬────────────┘
                           │ (Load Balances requests)
             ┌─────────────┴────────────┐
             │                          │
             ▼                          ▼
      [ Port 3000 ]              [ Port 3000 ]
 ┌──────────────────────┐   ┌──────────────────────┐
 │  Backend Replica #1  │   │  Backend Replica #2  │
 └───────────┬──────────┘   └───────────┬──────────┘
             │                          │
             ├──────────────────────────┤
             ▼                          ▼
     ┌───────────────┐          ┌───────────────┐
     │  Redis Cache  │          │ PostgreSQL DB │
     │  (Port 6379)  │          │  (Port 5432)  │
     └───────────────┘          └───────────────┘
```

### How High-Availability Features are Ensured:

1.  **SIGTERM Graceful Shutdown**: Express server captures container termination signals to safely close Redis client pools.
2.  **Socket.IO Syncing**: Multiple backend replicas synchronize client socket broadcasts using `@socket.io/redis-adapter` pub/sub.
3.  **Distributed Cron Jobs**: Crons (e.g., booking cleanup, match timeouts) use a Redis distributed lock (`NX` flag with TTL) to prevent duplicate runs across scaled backend nodes.
4.  **Database Migration Isolation**: The CI/CD script spins up a temporary runner container to execute `npx prisma migrate deploy` synchronously before scaling up backend instances.
5.  **Secure cache**: Redis requires password authentication (`--requirepass`) and postgres port is not exposed publicly on host.

---

### Fast Rollback Procedure

If a deployment fails or contains critical bugs, you can rollback immediately to the previous stable release using its Git SHA commit tag:

```bash
IMAGE_TAG=<PREVIOUS_STABLE_COMMIT_SHA> docker compose -f docker-compose.prod.yml up -d
```

---

## Available Scripts Reference

### Root Directory
*   `docker compose up` / `docker compose down`: Starts/stops local development containers.

### Backend (`apps/backend`)
| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts hot-reloading development server via `tsx watch` |
| `npm run build` | Compiles TypeScript into JavaScript (`dist/`) |
| `npm run start` | Runs compiled backend server in production |
| `npm run populate:embeddings` | Re-calculates and updates vector embeddings for all subfields |
| `npx prisma studio` | Launches Prisma GUI database explorer |

### Frontend (`apps/frontend`)
| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts local Vite development server |
| `npm run build` | Compiles React app static files (Vite build) |
| `npm run lint` | Inspects code quality issues via ESLint |

---

## Troubleshooting Guide

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `DATABASE_URL required during build` | Prisma config file failing to compile without env | Added mock fallback URL inside `prisma.config.js` to bypass compile-time requirement. |
| `Prisma migrate deploy fails in Docker` | Missing config file in runner stage | Ensure `prisma.config.js` is explicitly copied into the production container runner stage in the Dockerfile. |
| `Socket events missing on scale=2` | Client and server connected to different replicas | Handled. Verify that the Redis host and port are configured correctly to let `@socket.io/redis-adapter` sync events. |
| `Cron jobs running twice` | Multiple replicas firing tasks simultaneously | Handled. Cron jobs now use `runWithLock` helper using Redis locks. Verify Redis connection is online. |
| `Emails not sending` | Invalid mail server configuration | Ensure Gmail app password is used inside `MAIL_PASS` instead of raw account password. |

---

## License

This project is licensed under the MIT License.
