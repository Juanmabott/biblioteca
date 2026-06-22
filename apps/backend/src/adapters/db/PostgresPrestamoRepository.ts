import type pg from "pg";
import { Prestamo, type PrestamoRepository } from "@biblioteca/domain";

interface PrestamoRow {
  id: string;
  libro_id: string;
  socio_id: string;
  fecha_prestamo: Date;
  fecha_vencimiento: Date;
  fecha_devolucion: Date | null;
}

function toEntity(row: PrestamoRow): Prestamo {
  return Prestamo.reconstituir({
    id: row.id,
    libroId: row.libro_id,
    socioId: row.socio_id,
    fechaPrestamo: new Date(row.fecha_prestamo),
    fechaVencimiento: new Date(row.fecha_vencimiento),
    ...(row.fecha_devolucion
      ? { fechaDevolucion: new Date(row.fecha_devolucion) }
      : {}),
  });
}

export class PostgresPrestamoRepository implements PrestamoRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findById(id: string): Promise<Prestamo | null> {
    const { rows } = await this.pool.query<PrestamoRow>(
      "SELECT * FROM prestamos WHERE id = $1",
      [id],
    );
    return rows[0] ? toEntity(rows[0]) : null;
  }

  async findActivosBySocio(socioId: string): Promise<Prestamo[]> {
    const { rows } = await this.pool.query<PrestamoRow>(
      "SELECT * FROM prestamos WHERE socio_id = $1 AND fecha_devolucion IS NULL",
      [socioId],
    );
    return rows.map(toEntity);
  }

  async findBySocio(socioId: string): Promise<Prestamo[]> {
    const { rows } = await this.pool.query<PrestamoRow>(
      "SELECT * FROM prestamos WHERE socio_id = $1 ORDER BY fecha_prestamo DESC",
      [socioId],
    );
    return rows.map(toEntity);
  }

  async save(prestamo: Prestamo): Promise<void> {
    await this.pool.query(
      `INSERT INTO prestamos (id, libro_id, socio_id, fecha_prestamo, fecha_vencimiento, fecha_devolucion)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         fecha_devolucion = EXCLUDED.fecha_devolucion`,
      [
        prestamo.id,
        prestamo.libroId,
        prestamo.socioId,
        prestamo.fechaPrestamo,
        prestamo.fechaVencimiento,
        prestamo.fechaDevolucion ?? null,
      ],
    );
  }
}
