import type pg from "pg";
import { Libro, type LibroRepository } from "@biblioteca/domain";

interface LibroRow {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  copias_totales: number;
  copias_disponibles: number;
}

function toEntity(row: LibroRow): Libro {
  return Libro.reconstituir({
    id: row.id,
    titulo: row.titulo,
    autor: row.autor,
    isbn: row.isbn,
    copiasTotales: row.copias_totales,
    copiasDisponibles: row.copias_disponibles,
  });
}

export class PostgresLibroRepository implements LibroRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findById(id: string): Promise<Libro | null> {
    const { rows } = await this.pool.query<LibroRow>(
      "SELECT * FROM libros WHERE id = $1",
      [id],
    );
    return rows[0] ? toEntity(rows[0]) : null;
  }

  async findByIsbn(isbn: string): Promise<Libro | null> {
    const { rows } = await this.pool.query<LibroRow>(
      "SELECT * FROM libros WHERE isbn = $1",
      [isbn],
    );
    return rows[0] ? toEntity(rows[0]) : null;
  }

  async listAll(): Promise<Libro[]> {
    const { rows } = await this.pool.query<LibroRow>(
      "SELECT * FROM libros ORDER BY titulo",
    );
    return rows.map(toEntity);
  }

  async save(libro: Libro): Promise<void> {
    await this.pool.query(
      `INSERT INTO libros (id, titulo, autor, isbn, copias_totales, copias_disponibles)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         titulo = EXCLUDED.titulo,
         autor = EXCLUDED.autor,
         isbn = EXCLUDED.isbn,
         copias_totales = EXCLUDED.copias_totales,
         copias_disponibles = EXCLUDED.copias_disponibles`,
      [
        libro.id,
        libro.titulo,
        libro.autor,
        libro.isbn,
        libro.copiasTotales,
        libro.copiasDisponibles,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.query("DELETE FROM libros WHERE id = $1", [id]);
  }
}
