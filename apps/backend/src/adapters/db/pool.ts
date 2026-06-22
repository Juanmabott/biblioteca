import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

/** Crea un pool de conexiones a PostgreSQL a partir de la URL de conexión. */
export function createPool(databaseUrl: string): pg.Pool {
  return new Pool({ connectionString: databaseUrl });
}

/** Ejecuta el schema de forma idempotente (CREATE TABLE IF NOT EXISTS). */
export async function ensureSchema(pool: pg.Pool): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const sql = await readFile(join(here, "schema.sql"), "utf8");
  await pool.query(sql);
}

export type { Pool } from "pg";
