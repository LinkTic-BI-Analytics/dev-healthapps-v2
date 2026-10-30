# Imagen de Health Apps para desarrollo y producción.
#   docker build --target dev  -> next dev con hot reload (lo usa docker-compose.yml)
#   docker build --target prod -> imagen mínima de producción (por defecto)
#   docker build --target migrator -> aplica las migraciones y el seed (roles, permisos, superadmin)
#   docker build --target worker   -> worker de verificaciones periódicas (ADR-004)
# Las variables DB_* se inyectan en tiempo de ejecución; la imagen no contiene .env ni credenciales.

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base
# pnpm 11 verifica (y reinstala) las dependencias antes de cada script; en la imagen ya están instaladas.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1 \
    npm_config_verify_deps_before_run=false
RUN corepack enable
WORKDIR /app

# ─── Dependencias (incluye las de desarrollo; el postinstall genera el cliente de Prisma) ───
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
COPY src/lib/db/config.ts ./src/lib/db/config.ts
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ─── Desarrollo: el código se monta como volumen (ver docker-compose.yml) ───
FROM base AS dev
# CI=true: pnpm no pide confirmación interactiva al reconstruir node_modules.
ENV CI=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
# `pnpm install` al arrancar: si cambiaron las dependencias, actualiza el node_modules del contenedor
# (volumen anónimo) sin tener que recrearlo; si no cambiaron, termina en segundos.
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm db:generate && pnpm db:deploy && pnpm db:seed && pnpm dev --hostname 0.0.0.0 --port 3000"]

# ─── Build de producción ───
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm db:generate && pnpm build

# ─── Migraciones (prisma migrate deploy) ───
FROM base AS migrator
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
USER node
CMD ["sh", "-c", "pnpm db:deploy && pnpm db:seed"]

# ─── Worker de verificaciones (ADR-004): proceso aparte, sin servidor HTTP ───
FROM base AS worker
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN pnpm db:generate
USER node
CMD ["pnpm", "worker"]

# ─── Producción ───
FROM node:${NODE_VERSION}-alpine AS prod
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["node", "server.js"]
