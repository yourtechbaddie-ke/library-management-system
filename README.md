# Library Management System

A full-stack library catalogue built with a responsive browser frontend, NestJS, Prisma and PostgreSQL.

## Project structure
- `web/` — responsive catalogue interface with genre browsing, search, saved titles and add-book form.
- `api/` — NestJS REST API, Prisma data layer, database migration and seed script.

## Schema Decisions

**Why Book references Genre instead of embedding it**

A genre is shared catalog data. Storing a `genreId` foreign key means a genre name or description can be updated once rather than repeated across every book. The relation also gives PostgreSQL referential integrity: a book cannot point to a genre that does not exist. It avoids inconsistent labels and spelling variants, and supports efficient queries from either side (books by genre, or genre counts). Since many books belong to a relatively small set of genres, a normalized one-to-many relation is a better fit than duplicating genre data in every book document.

## Seed data
`api/prisma/seed.ts` creates five genres and sixteen books distributed across them, plus two sample users and three reviews.

## Prisma vs. a document database
The biggest difference is that Prisma makes relationships explicit up front. In a document database, a book could carry a free-form genre string and be saved immediately. With Prisma, the Genre model, foreign key and relation are declared in the schema, then applied through a migration. That takes a little more setup, but the database enforces consistency rather than relying on application code to remember it.

## Run locally
1. Create a PostgreSQL database and copy `api/.env.example` to `api/.env` with its connection URL.
2. From `api/`: `npm install && npx prisma generate && npx prisma migrate deploy && npm run seed && npm run start:dev`.
3. From `web/`: `npm install && npm run dev`.
4. Set `VITE_API_URL` to the deployed API origin when connecting the Vercel frontend to the backend.

## Deployment
Deploy `web/` as a Vercel project with `VITE_API_URL` configured. Deploy `api/` separately with `DATABASE_URL` and `WEB_ORIGIN` configured. Keep secrets in hosting environment variables; never commit them.
