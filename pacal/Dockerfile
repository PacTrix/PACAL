FROM node:20-alpine AS base

# ─── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN npm install -g pnpm@9

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Reçus depuis docker-compose (build.args) — relayés en NEXT_PUBLIC_* pour
# être inlinés au build par Next.js. Sans ces deux lignes, les build-args
# de docker-compose.yml n'atteignent jamais le process `next build` et
# l'en-tête affiche une version vide quelle que soit la commande utilisée.
ARG APP_VERSION=dev
ARG BUILD_DATE=inconnue
ENV NEXT_PUBLIC_APP_VERSION=$APP_VERSION
ENV NEXT_PUBLIC_BUILD_DATE=$BUILD_DATE

# Sauter la validation des variables d'env au build
ENV SKIP_ENV_VALIDATION=1
RUN pnpm build

# ─── Runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Volume photos (monté depuis le NAS)
RUN mkdir -p /data/photos && chown nextjs:nodejs /data/photos

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
