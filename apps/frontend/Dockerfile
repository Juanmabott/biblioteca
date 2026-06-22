# Frontend: build con Vite (multi-stage) y servido por Nginx, que además actúa
# como reverse proxy hacia el backend para las rutas /api.

# --- Etapa de build ---
FROM node:20-slim AS build
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --filter @biblioteca/frontend... --frozen-lockfile=false

COPY apps/frontend ./apps/frontend
RUN pnpm --filter @biblioteca/frontend build

# --- Etapa de runtime ---
FROM nginx:1.27-alpine
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
