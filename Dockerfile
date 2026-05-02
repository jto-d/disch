# syntax=docker/dockerfile:1.7

# ─── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# OpenSSL is required by the Prisma query engine.
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copy workspace manifests first so layer caching survives source edits.
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN npm ci

# Copy source.
COPY shared ./shared
COPY server ./server
COPY client ./client

# Generate the Prisma client and build the Vite static bundle.
RUN npx prisma generate --schema=server/prisma/schema.prisma
RUN npm run build --workspace=client

# ─── Stage 2: runtime ────────────────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080

# Bring across only what the runtime needs:
# - hoisted node_modules (incl. tsx + the generated Prisma client)
# - workspace manifests so `npm start --workspace=server` can find the script
# - server source (tsx runs TS directly — no separate JS compile step)
# - shared schemas (imported via the @disch/shared alias)
# - the built client static assets
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/package.json ./client/package.json
COPY --from=builder /app/client/dist ./client/dist

# Drop privileges.
RUN useradd --system --uid 1001 nodeapp \
 && chown -R nodeapp:nodeapp /app
USER nodeapp

EXPOSE 8080

# `npm start` in /server runs `tsx src/index.ts`. The server reads PORT from
# the env, which Cloud Run injects automatically.
CMD ["npm", "start", "--workspace=server"]
