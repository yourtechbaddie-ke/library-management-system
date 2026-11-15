# Midnight Library — Library Management System

A full-stack library catalogue with a Midnight Library editorial interface, a NestJS REST API, Prisma and PostgreSQL.

## Project structure

- `app/` — **primary Next.js frontend** (the application served from the repository root).
- `api/` — NestJS REST API, authentication, Prisma data layer, migrations and seed script.
- `web/` — standalone HTML catalogue preview; the primary Vercel frontend is the root Next.js app.
- `docs/` — API request collection.

## Frontend design

The main application uses the Midnight Library direction: midnight charcoal, forest green, warm ivory and antique gold; Playfair Display editorial headings; a responsive sidebar; genre browsing; reading-list saves; and carefully constrained book-cover typography. Long titles and author names are clamped inside their cover frames and catalogue cards.

The frontend can run in preview mode with sample catalogue data. To load live records, set the public environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-api-host.example
```

Use the API origin only (no trailing slash and no `/api` suffix). The frontend calls `/api/books`, `/api/genres`, and `/api/auth/login` itself.

## API environment

Configure these server-side variables on the API host. Never commit real credentials:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
WEB_ORIGIN=https://your-frontend-domain.example
```

The API uses the global `/api` prefix. Its CORS origin must include the deployed frontend origin. The API requires a reachable PostgreSQL database and the Prisma migrations to be applied before live data is available.

## Run locally

1. Create a PostgreSQL database and configure `api/.env` using the variables above.
2. From `api/` run:

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run seed
   npm run start:dev
   ```

3. From the repository root, set `NEXT_PUBLIC_API_URL=http://localhost:3000`, then run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the Next.js development URL shown in the terminal.

## Deployment

- Deploy the repository root as the Next.js frontend (root directory `.`).
- Set `NEXT_PUBLIC_API_URL` in the frontend hosting provider to the deployed API origin.
- Deploy `api/` as a separate NestJS service with its own `DATABASE_URL`, `JWT_SECRET`, and `WEB_ORIGIN` environment variables.
- Apply Prisma migrations and seed data against the production database before expecting live catalogue records.

The frontend's sample catalogue is a preview fallback, not a substitute for a configured API and production database.
