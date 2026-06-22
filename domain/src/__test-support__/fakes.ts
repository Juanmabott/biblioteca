import type { Libro } from "../entities/Libro.js";
import type { Usuario } from "../entities/Usuario.js";
import { Prestamo } from "../entities/Prestamo.js";
import type {
  LibroRepository,
  UsuarioRepository,
  PrestamoRepository,
} from "../services/repositories.js";
import type { Clock, IdGenerator, PasswordHasher } from "../services/ports.js";

/** Dobles de prueba en memoria para ejercitar los casos de uso sin infraestructura real. */

export class InMemoryLibroRepository implements LibroRepository {
  private libros = new Map<string, Libro>();

  constructor(iniciales: Libro[] = []) {
    for (const libro of iniciales) this.libros.set(libro.id, libro);
  }

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

  constructor(iniciales: Usuario[] = []) {
    for (const u of iniciales) this.usuarios.set(u.id, u);
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.usuarios.get(id) ?? null;
  }
  async findByEmail(email: string): Promise<Usuario | null> {
    for (const u of this.usuarios.values()) {
      if (u.email === email.toLowerCase()) return u;
    }
    return null;
  }
  async save(usuario: Usuario): Promise<void> {
    this.usuarios.set(usuario.id, usuario);
  }
}

export class InMemoryPrestamoRepository implements PrestamoRepository {
  private prestamos = new Map<string, Prestamo>();

  constructor(iniciales: Prestamo[] = []) {
    for (const p of iniciales) this.prestamos.set(p.id, p);
  }

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

/** Reloj fijo: devuelve siempre la misma fecha. */
export class FixedClock implements Clock {
  constructor(private fecha: Date) {}
  now(): Date {
    return this.fecha;
  }
  set(fecha: Date): void {
    this.fecha = fecha;
  }
}

/** Generador de ids incremental y predecible. */
export class SequentialIdGenerator implements IdGenerator {
  private n = 0;
  constructor(private prefijo = "id") {}
  next(): string {
    this.n += 1;
    return `${this.prefijo}-${this.n}`;
  }
}

/** Hasher falso, reversible y determinista, solo para tests. */
export class FakePasswordHasher implements PasswordHasher {
  async hash(plano: string): Promise<string> {
    return `hash::${plano}`;
  }
  async compare(plano: string, hash: string): Promise<boolean> {
    return hash === `hash::${plano}`;
  }
}
