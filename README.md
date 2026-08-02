# Biblioteca

Sistema de gestión de biblioteca — préstamos, catálogo y roles. Monorepo **NodeJS + TypeScript**
desarrollado con **arquitectura limpia** y **TDD**, en tres etapas: dominio + backend, frontend,
y orquestación con docker-compose.

## Estructura

```
biblioteca/
├── domain/              # Núcleo: entidades, casos de uso, puertos. Sin dependencias externas.
│   └── src/
│       ├── entities/
│       ├── use-cases/
│       └── services/    # Puertos (interfaces): repositorios, hasher, clock, ...
└── apps/
    ├── backend/         # Express. Adapta los casos de uso del dominio a una API REST.
    └── frontend/        # Vite + React + Storybook.
```

La regla de dependencias apunta hacia adentro: `apps/*` dependen de `domain`; `domain`
no depende de nadie. Los detalles (HTTP, base de datos, UI) viven en los bordes e
implementan los puertos que el dominio define.

## Decisiones de diseño

- **Dominio puro:** las reglas de negocio (quién puede prestar, cuándo se puede devolver,
  roles) viven en `domain/` y se testean sin levantar servidor ni base de datos.
- **Puertos e inyección de dependencias:** el dominio define interfaces (`repositorios`,
  `hasher`, `clock`) y cada app inyecta su implementación. Esto permite el swap
  transparente entre PostgreSQL y repos en memoria.
- **TDD en el dominio, Visual TDD en el frontend:** los casos de uso nacieron test-first
  con Vitest; los componentes presentacionales nacieron story-first en Storybook con sus
  tests de Testing Library.

## Stack

- TypeScript en todo el monorepo
- pnpm workspaces
- Vitest (tests del dominio) + Supertest (integración) + Testing Library (componentes)
- Express (backend)
- Vite + React + Storybook (frontend)
- Docker Compose (PostgreSQL + backend + frontend con Nginx)

## Comandos

```bash
pnpm install        # instalar dependencias de todos los paquetes
pnpm test           # correr tests de todos los paquetes
pnpm test:domain    # correr solo los tests del dominio
pnpm typecheck      # chequeo de tipos
```

### Backend

```bash
pnpm --filter @biblioteca/backend dev     # levanta la API en http://localhost:3000
pnpm --filter @biblioteca/backend test    # tests de integración (supertest)
```

Al arrancar se crea un bibliotecario seed (`admin@biblioteca.test` / `admin12345`, solo
para desarrollo). Ver `apps/backend/requests.http` para probar los endpoints, y
`apps/backend/.env.example` para la configuración.

#### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET  | `/health` | — | Estado del servicio |
| POST | `/auth/register` | — | Registrar un socio |
| POST | `/auth/login` | — | Login, devuelve JWT |
| GET  | `/libros` | — | Listar catálogo (público, modo invitado) |
| POST | `/libros` | JWT (bibliotecario) | Crear libro |
| PUT  | `/libros/:id` | JWT (bibliotecario) | Editar libro |
| DELETE | `/libros/:id` | JWT (bibliotecario) | Eliminar libro |
| POST | `/prestamos` | JWT (socio) | Prestar un libro |
| POST | `/prestamos/:id/devolucion` | JWT | Devolver un libro |

### Frontend

```bash
pnpm --filter @biblioteca/frontend dev         # app en http://localhost:5173
pnpm --filter @biblioteca/frontend storybook   # Storybook en http://localhost:6006
pnpm --filter @biblioteca/frontend test        # tests de componentes (Testing Library)
```

Construido con **Visual TDD**: cada componente presentacional (`LibroCard`, `LoginForm`,
`CatalogoList`) tiene sus *stories* en Storybook y sus tests. La capa `src/api` aísla la
comunicación HTTP con el backend y `src/auth` maneja el JWT. En desarrollo, Vite proxea
`/api` hacia el backend (`http://localhost:3000`).

La página de login está centrada, con navbar, e incluye un **modo invitado** para
explorar el catálogo en solo lectura sin registrarse.

## Docker

Levanta base de datos + backend + frontend con un solo comando:

```bash
cp .env.example .env     # ajustá secretos
docker compose up --build
```

- Frontend (Nginx + SPA, reverse proxy de `/api`): http://localhost:8080
- API directa: http://localhost:3000
- Base de datos: PostgreSQL (servicio `db`, datos en el volumen `db-data`)

El backend elige automáticamente PostgreSQL cuando hay `DATABASE_URL` (como en
`docker-compose`) y repos en memoria en caso contrario. Ver
`docs/REFLEXION-etapa3-hosting.md` para HTTPS, secretos y reverse proxy.

## Documentación

- `docs/REFLEXION-etapa1.md` — decisiones de dominio y arquitectura
- `docs/REFLEXION-etapa3-hosting.md` — HTTPS, manejo de secretos y reverse proxy
