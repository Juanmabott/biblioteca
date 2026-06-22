import type {
  Libro,
  Usuario,
  Prestamo,
  LibroRepository,
  UsuarioRepository,
  PrestamoRepository,
} from "@biblioteca/domain";

/**
 * Repositorios en memoria. Implementan los puertos del dominio y sirven para
 * desarrollo y pruebas. En la etapa de docker-compose se reemplazarán por una
 * implementación sobre PostgreSQL sin tocar el dominio ni los casos de uso.
 */

export class InMemoryLibroRepository implements LibroRepository {
  private libros = new Map<string, Libro>();

  async findById(id: string): Promise<Libro | null> {
    return this.libros.get(id) ?? null;
  }
  async findByIsbn(isbn: string): Promise<Libro | null> {
    for (const libro of this.libros.values()) {
      if (libro.isbn === isbn) return libro;
    }
    return null;
  }
  async listAll(): Promise<Libro[]> {
    return [...this.libros.values()];
  }
  async save(libro: Libro): Promise<void> {
    this.libros.set(libro.id, libro);
  }
  async delete(id: string): Promise<void> {
    this.libros.delete(id);
  }
}

export class InMemoryUsuarioRepository implements UsuarioRepository {
  private usuarios = new Map<string, Usuario>();

  async findById(id: string): Promise<Usuario | null> {
    return this.usuarios.get(id) ?? null;
  }
  async findByEmail(email: string): Promise<Usuario | null> {
    const normalizado = email.toLowerCase();
    for (const u of this.usuarios.values()) {
      if (u.email === normalizado) return u;
    }
    return null;
  }
  async save(usuario: Usuario): Promise<void> {
    this.usuarios.set(usuario.id, usuario);
  }
}

export class InMemoryPrestamoRepository implements PrestamoRepository {
  private prestamos = new Map<string, Prestamo>();

  async findById(id: string): Promise<Prestamo | null> {
    return this.prestamos.get(id) ?? null;
  }
  async findActivosBySocio(socioId: string): Promise<Prestamo[]> {
    return [...this.prestamos.values()].filter(
      (p) => p.socioId === socioId && !p.estaDevuelto(),
    );
  }
  async findBySocio(socioId: string): Promise<Prestamo[]> {
    return [...this.prestamos.values()].filter((p) => p.socioId === socioId);
  }
  async save(prestamo: Prestamo): Promise<void> {
    this.prestamos.set(prestamo.id, prestamo);
  }
}
