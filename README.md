# StockFlow

Full-stack inventory management MVP. Source files only: dependencies have not been installed and no build, migration, server, or tests have been run.

## Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form, Zod, Recharts, Lucide
- Backend: NestJS, Prisma, PostgreSQL
- API prefix: `/api`

## Project layout
- `backend/` NestJS REST API and Prisma schema
- `frontend/` React application
- `docker-compose.yml` local PostgreSQL only

## Setup (run manually)
1. Install Node.js LTS, pnpm, and Docker Desktop.
2. From this folder, install workspace dependencies: `pnpm install`
3. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.
4. Start PostgreSQL: `docker compose up -d db`
5. Run migrations and seed from `backend/`:
   - `pnpm prisma:migrate`
   - `pnpm prisma:seed`
6. Start API and frontend in separate terminals:
   - `pnpm --dir backend start:dev`
   - `pnpm --dir frontend dev`

API defaults to `http://localhost:4000/api`; frontend defaults to `http://localhost:5173`.

## Important
This is an initial implementation baseline, not a verified build. Review environment settings before use. No production secrets are included. The stock operation service uses a database transaction and conditional update to prevent overselling. The current product quantity is the operational balance; movements are the audit ledger. Reconciliation should compare each product quantity to its movement ledger and flag differences for explicit correction, never silently rewrite history.
