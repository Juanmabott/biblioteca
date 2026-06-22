import { Prestamo } from "../entities/Prestamo.js";
import { Permiso } from "../entities/roles.js";
import {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../errors/DomainError.js";
import type {
  LibroRepository,
  UsuarioRepository,
  PrestamoRepository,
} from "../services/repositories.js";
import type { Clock, IdGenerator } from "../services/ports.js";

export interface PrestarLibroInput {
  socioId: string;
  libroId: string;
}

export interface PrestarLibroRepos {
  libros: LibroRepository;
  usuarios: UsuarioRepository;
  prestamos: PrestamoRepository;
}

export interface PrestarLibroConfig {
  clock: Clock;
  idGen: IdGenerator;
  /** Duración del préstamo en días. */
  diasPrestamo: number;
  /** Cantidad máxima de préstamos activos simultáneos por socio. */
  maxPrestamosActivos: number;
}

/**
 * Caso de uso: un socio toma prestado un libro.
 *
 * Reglas de negocio combinadas:
 *  - El socio debe existir y tener permiso para prestar.
 *  - El libro debe existir y tener copias disponibles.
 *  - El socio no debe superar el límite de préstamos activos.
 *  - El socio no debe tener préstamos vencidos.
 */
export class PrestarLibro {
  constructor(
    private readonly repos: PrestarLibroRepos,
    private readonly config: PrestarLibroConfig,
  ) {}

  async ejecutar(input: PrestarLibroInput): Promise<Prestamo> {
    const { libros, usuarios, prestamos } = this.repos;
    const { clock, idGen, diasPrestamo, maxPrestamosActivos } = this.config;

    const socio = await usuarios.findById(input.socioId);
    if (!socio) {
      throw new NotFoundError(`No existe el socio ${input.socioId}.`);
    }
    if (!socio.tienePermiso(Permiso.PRESTAR_LIBRO)) {
      throw new ForbiddenError("El usuario no tiene permiso para prestar libros.");
    }

    const libro = await libros.findById(input.libroId);
    if (!libro) {
      throw new NotFoundError(`No existe el libro ${input.libroId}.`);
    }

    const ahora = clock.now();
    const activos = await prestamos.findActivosBySocio(socio.id);

    if (activos.some((p) => p.estaVencido(ahora))) {
      throw new BusinessRuleError(
        "El socio tiene préstamos vencidos y no puede tomar nuevos.",
      );
    }
    if (activos.length >= maxPrestamosActivos) {
      throw new BusinessRuleError(
        `El socio alcanzó el límite de ${maxPrestamosActivos} préstamos activos.`,
      );
    }

    // Reserva la copia (lanza si no hay disponibles) y persiste el cambio de stock.
    libro.prestar();

    const prestamo = Prestamo.crearPorDias({
      id: idGen.next(),
      libroId: libro.id,
      socioId: socio.id,
      fechaPrestamo: ahora,
      dias: diasPrestamo,
    });

    await libros.save(libro);
    await prestamos.save(prestamo);

    return prestamo;
  }
}
