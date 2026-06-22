import type { Libro } from "../entities/Libro.js";
import type { Usuario } from "../entities/Usuario.js";
import type { Prestamo } from "../entities/Prestamo.js";

/**
 * Puertos de persistencia (repositorios). El dominio define estas interfaces;
 * la infraestructura (backend) las implementa contra una base de datos real o
 * un almacenamiento en memoria. Todos los métodos son asíncronos para no atar
 * el dominio a un mecanismo de persistencia concreto.
 */

export interface LibroRepository {
  findById(id: string): Promise<Libro | null>;
  findByIsbn(isbn: string): Promise<Libro | null>;
  listAll(): Promise<Libro[]>;
  save(libro: Libro): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface UsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  save(usuario: Usuario): Promise<void>;
}

export interface PrestamoRepository {
  findById(id: string): Promise<Prestamo | null>;
  /** Préstamos del socio que aún no fueron devueltos. */
  findActivosBySocio(socioId: string): Promise<Prestamo[]>;
  /** Todos los préstamos del socio (activos, vencidos y devueltos). */
  findBySocio(socioId: string): Promise<Prestamo[]>;
  save(prestamo: Prestamo): Promise<void>;
}
