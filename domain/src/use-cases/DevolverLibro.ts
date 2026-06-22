import { Prestamo } from "../entities/Prestamo.js";
import { NotFoundError } from "../errors/DomainError.js";
import type {
  LibroRepository,
  PrestamoRepository,
} from "../services/repositories.js";
import type { Clock } from "../services/ports.js";

export interface DevolverLibroInput {
  prestamoId: string;
}

export interface DevolverLibroRepos {
  libros: LibroRepository;
  prestamos: PrestamoRepository;
}

export interface DevolverLibroConfig {
  clock: Clock;
}

/**
 * Caso de uso: registrar la devolución de un libro prestado.
 * Marca el préstamo como devuelto (la entidad valida que no esté ya devuelto)
 * y repone la copia en el catálogo.
 */
export class DevolverLibro {
  constructor(
    private readonly repos: DevolverLibroRepos,
    private readonly config: DevolverLibroConfig,
  ) {}

  async ejecutar(input: DevolverLibroInput): Promise<Prestamo> {
    const { libros, prestamos } = this.repos;

    const prestamo = await prestamos.findById(input.prestamoId);
    if (!prestamo) {
      throw new NotFoundError(`No existe el préstamo ${input.prestamoId}.`);
    }

    const libro = await libros.findById(prestamo.libroId);
    if (!libro) {
      throw new NotFoundError(`No existe el libro ${prestamo.libroId}.`);
    }

    // La entidad lanza BusinessRuleError si el préstamo ya fue devuelto.
    prestamo.devolver(this.config.clock.now());
    libro.devolver();

    await prestamos.save(prestamo);
    await libros.save(libro);

    return prestamo;
  }
}
