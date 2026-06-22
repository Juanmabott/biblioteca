# Backend: monorepo pnpm. Se ejecuta con tsx (TypeScript directo, sin build previo).
FROM node:20-slim

# Habilita pnpm via corepack.
RUN corepack enable

WORKDIR /app

# Copia los manifiestos primero para aprovechar la cache de capas.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./
COPY domain/package.json ./domain/
COPY apps/backend/package.json ./apps/backend/

# Instala dependencias de domain + backend (sin el frontend).
RUN pnpm install --filter @biblioteca/backend... --frozen-lockfile=false

# Copia el código fuente.
COPY domain ./domain
COPY apps/backend ./apps/backend

EXPOSE 3000
CMD ["pnpm", "--filter", "@biblioteca/backend", "start"]
