import type pg from "pg";
import { Usuario, type UsuarioRepository, type Rol } from "@biblioteca/domain";

interface UsuarioRow {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: Rol;
}

function toEntity(row: UsuarioRow): Usuario {
  return Usuario.crear({
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    passwordHash: row.password_hash,
    rol: row.rol,
  });
}

export class PostgresUsuarioRepository implements UsuarioRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findById(id: string): Promise<Usuario | null> {
    const { rows } = await this.pool.query<UsuarioRow>(
      "SELECT * FROM usuarios WHERE id = $1",
      [id],
    );
    return rows[0] ? toEntity(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const { rows } = await this.pool.query<UsuarioRow>(
      "SELECT * FROM usuarios WHERE email = $1",
      [email.toLowerCase()],
    );
    return rows[0] ? toEntity(rows[0]) : null;
  }

  async save(usuario: Usuario): Promise<void> {
    await this.pool.query(
      `INSERT INTO usuarios (id, nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         rol = EXCLUDED.rol`,
      [usuario.id, usuario.nombre, usuario.email, usuario.passwordHash, usuario.rol],
    );
  }
}
