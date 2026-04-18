# Personal Expense Tracker

Production-hardened full-stack expense tracker:

- Frontend: React + Vite + Tailwind + Redux Toolkit + Recharts
- Backend: Node.js + Express + MongoDB + Mongoose + JWT
- Security: Helmet, CORS allowlist, API rate limiting, compression, centralized error handling
- Testing: Vitest + React Testing Library, Jest + Supertest

## Local Development

### 1. Install dependencies

```bash
npm install --prefix server
npm install --prefix client
```

### 2. Configure environment

Create `server/.env` from [server/.env.example](server/.env.example).

Create `client/.env` from [client/.env.example](client/.env.example).

### 3. Run apps

Backend:

```bash
npm --prefix server run dev
```

Frontend:

```bash
npm --prefix client run dev
```

## Testing

Run both suites:

```bash
npm test
```

Run separately:

```bash
npm run test:server
npm run test:client
```

## Production Deployment (Docker)

### 1. Configure production env

Copy [`.env.production.example`](.env.production.example) to `.env.production` and fill secure values:

- `JWT_SECRET` must be a long random secret.
- `CLIENT_ORIGIN` should match your public frontend URL.

### 2. Build and start

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Frontend will be exposed on `APP_PORT` (default `80`).

## CI

GitHub Actions pipeline is defined at [ci.yml](.github/workflows/ci.yml) and runs:

- Server tests
- Client tests
- Client production build

