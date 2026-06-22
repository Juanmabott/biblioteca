-- Esquema de la base de datos de la biblioteca.
-- Se ejecuta de forma idempotente al arrancar el backend.

CREATE TABLE IF NOT EXISTS usuarios (
  id            TEXT PRIMARY KEY,
  nombre        TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS libros (
  id                 TEXT PRIMARY KEY,
  titulo             TEXT NOT NULL,
  autor              TEXT NOT NULL,
  isbn               TEXT NOT NULL UNIQUE,
  copias_totales     INTEGER NOT NULL,
  copias_disponibles INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS prestamos (
  id                TEXT PRIMARY KEY,
  libro_id          TEXT NOT NULL REFERENCES libros(id) ON DELETE CASCADE,
  socio_id          TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_prestamo    TIMESTAMPTZ NOT NULL,
  fecha_vencimiento TIMESTAMPTZ NOT NULL,
  fecha_devolucion  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_prestamos_socio ON prestamos(socio_id);
