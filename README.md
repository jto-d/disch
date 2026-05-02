# Disch Market

A mobile-only sentiment-based prediction market for a drinking event. Voters
predict things about each other (e.g. "who will drink the most?", "will Jake
puke before midnight?"). No money, no points — just collective sentiment. One
vote per person per market, locked in once submitted.

## Stack

- **Client**: Vite + React + TypeScript, Tailwind CSS, React Router (data
  router), TanStack Query (5s polling)
- **Server**: Express + TypeScript, Prisma + PostgreSQL
- **Shared**: Zod schemas + TypeScript types — single source of truth for
  request/response shapes
- **Auth**: honor system. A `voter_id` cookie (httpOnly, signed) identifies
  voters by Voter row. Admin is gated by an `ADMIN_PASSWORD` env var and a
  separate `admin` cookie.

## Project layout

```
client/    Vite + React app
  src/
    components/   MarketCard, VoteButtons, Bar, Toast, ...
    routes/       Entry, Feed, MarketDetail, Admin*
    lib/          api client + TanStack Query hooks + countdown
  tailwind.config.ts   tokens extracted from the design file

server/    Express API
  src/
    routes/       voter, markets, attendees, admin
    lib/          prisma, env, auth, validate, market mappers
  prisma/
    schema.prisma     Voter, Attendee, Market, Vote
    seed.ts

shared/    @disch/shared — Zod schemas + types imported by client & server
```

## Setup

1. Install dependencies (npm workspaces):

   ```bash
   npm install
   ```

2. Copy the env template and fill it in:

   ```bash
   cp .env.example server/.env
   # Edit server/.env: DATABASE_URL, ADMIN_PASSWORD, COOKIE_SECRET
   ```

   For local Postgres:
   ```bash
   createdb disch
   # DATABASE_URL=postgresql://localhost:5432/disch?schema=public
   ```

   For hosted Postgres (Neon, Supabase, Railway, RDS), paste the pooled
   connection string. Neon's pooler URL works out of the box; for raw RDS
   instances, prefer running PgBouncer in front.

3. Generate the Prisma client and run the initial migration:

   ```bash
   npm run db:migrate --workspace=server
   ```

   On a brand-new DB this will prompt to name the migration (`init` is fine)
   and create it under `server/prisma/migrations/`.

4. Seed sample attendees and markets:

   ```bash
   npm run db:seed
   ```

   Creates 3 attendees (Jake, Mia, Connor) and 2 markets — one YES/NO and one
   PICK_PERSON.

## Development

Run the client and server concurrently in two terminals:

```bash
npm run dev:server     # http://localhost:3001
npm run dev:client     # http://localhost:5173 (Vite proxies /api → :3001)
```

The Vite dev server proxies `/api/*` to the Express server, so the cookie is
same-origin from the browser's POV during dev too.

## Production build (same-origin, recommended)

The Express server statically serves the built Vite assets from
`client/dist/` if the directory exists, and falls back any non-`/api/*` route
to `index.html` for client-side routing. This means **one deployment** serves
both — no CORS, no cookie partitioning headaches.

```bash
npm run build
NODE_ENV=production npm start
```

In production:
- Cookies are issued with `secure: true` and `sameSite: lax`.
- `COOKIE_SECRET` must be a long random string.
- `ADMIN_PASSWORD` must be set.

## Deploy notes

### Same-origin (Render / Railway / Fly)

1. Provision Postgres (Neon / Supabase / Railway / RDS) and grab the
   connection string.
2. Set the env vars on your host: `DATABASE_URL`, `ADMIN_PASSWORD`,
   `COOKIE_SECRET`, `NODE_ENV=production`, optional `PORT`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Health check path: `/api/health` (returns `{ ok: true }`).
6. Run `prisma migrate deploy` once on first boot, e.g. as a release
   command:
   ```bash
   npm run db:migrate:deploy --workspace=server
   ```

### Split deployment (static client + Express API)

If you'd rather host the client on Vercel/Netlify/static-S3 and the API
elsewhere, set `CLIENT_ORIGIN` on the API to your client URL — the CORS
middleware already enables `credentials: true`:

```ts
// server/src/index.ts (already wired)
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
```

You'll also need to point the client at the API. The simplest swap is to
change the `fetch` base URL in `client/src/lib/api.ts` (or proxy via your
static host's redirects). Note: cross-site cookies require `sameSite: 'none'`
plus `secure`, so update `cookieBase` in `server/src/lib/auth.ts`.

Same-origin is strictly easier; only split if you have a reason.

## Connection pooling

For production Postgres, use a pooler:

- **Neon**: use the pooled connection string (the URL ending in
  `-pooler.<region>.aws.neon.tech` with `?pgbouncer=true&connection_limit=1`).
- **Supabase**: use port 6543 (PgBouncer pooler).
- **Self-hosted**: run PgBouncer in transaction mode.

Prisma honors the `?pgbouncer=true` flag and uses prepared-statement-safe
queries.

## Honor-system caveat

There is no real authentication. A determined user can clear cookies and
re-enter under a new name to vote again. The DB unique constraint on
`(marketId, voterId)` only prevents the *same* cookie identity from voting
twice on the same market. This is intentional for the scope (one drinking
event); upgrading to phone-number/SSO auth is a future enhancement.

## Adding a new market type

The codebase is set up so a follow-up agent can add (e.g.) an OVER/UNDER
market by:

1. Extending the Prisma `MarketType` enum and creating a migration.
2. Adding the variant to `MarketType` in `shared/src/index.ts` and a new
   discriminated union arm to `MarketDTO`.
3. Adding aggregate computation in `server/src/lib/markets.ts → toDTO`.
4. Writing `OverUnderResult.tsx` + `OverUnderVoteUI.tsx` and rendering them
   from `MarketCard.tsx` and `MarketDetail.tsx`.

No app-wide refactor required.

## Assumptions

- Single event instance per deployment. To run another Disch, wipe the DB or
  redeploy with a fresh one.
- 5-second polling on the feed is sufficient — no WebSockets in v1.
- No rate limiting in v1. If spam becomes a concern, add `express-rate-limit`
  on the vote endpoint keyed by IP + voter cookie.
- Single shared admin password.

## Scripts cheatsheet

| Command                          | What it does                                |
|----------------------------------|---------------------------------------------|
| `npm run dev:client`             | Vite dev server (port 5173)                 |
| `npm run dev:server`             | Express + tsx watch (port 3001)             |
| `npm run build`                  | Build shared, client, server                |
| `npm start`                      | Run built server (serves API + static)      |
| `npm run db:migrate`             | `prisma migrate dev`                        |
| `npm run db:seed`                | Reset+seed sample attendees & markets       |
| `npm run db:reset`               | `prisma migrate reset --force`              |
