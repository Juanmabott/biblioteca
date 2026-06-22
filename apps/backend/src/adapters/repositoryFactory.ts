import type {
  LibroRepository,
  UsuarioRepository,
  PrestamoRepository,
} from "@biblioteca/domain";
import type { AppConfig } from "../config.js";
import {
  InMemoryLibroRepository,
  InMemoryUsuarioRepository,
  InMemoryPrestamoRepository,
} from "./repositories.js";
import { createPool, ensureSchema } from "./db/pool.js";
import { PostgresLibroRepository } from "./db/PostgresLibroRepository.js";
import { PostgresUsuarioRepository } from "./db/PostgresUsuarioRepository.js";
import { PostgresPrestamoRepository } from "./db/PostgresPrestamoRepository.js";

export interface Repositories {
  libros: LibroRepository;
  usuarios: UsuarioRepository;
  prestamos: PrestamoRepository;
  /** Prepara el almacenamiento (p. ej. crea el schema). No-op en memoria. */
  init(): Promise<void>;
  /** Libera recursos (p. ej. cierra el pool). No-op en memoria. */
  close(): Promise<void>;
}

/**
 * Decide la implementación de persistencia según la configuración: PostgreSQL si
 * hay DATABASE_URL, repos en memoria en caso contrario. El dominio no se entera.
 */
export function buildRepositories(config: AppConfig): Repositories {
  if (config.databaseUrl) {
    const pool = createPool(config.databaseUrl);
    return {
      libros: new PostgresLibroRepository(pool),
      usuarios: new PostgresUsuarioRepository(pool),
      prestamos: new PostgresPrestamoRepository(pool),
      init: () => ensureSchema(pool),
      close: () => pool.end(),
    };
  }

  return {
    libros: new InMemoryLibroRepository(),
    usuarios: new InMemoryUsuarioRepository(),
    prestamos: new InMemoryPrestamoRepository(),
    init: async () => {},
    close: async () => {},
  };
}
