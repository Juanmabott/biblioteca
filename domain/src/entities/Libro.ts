import { ValidationError, BusinessRuleError } from "../errors/DomainError.js";

export interface CrearLibroProps {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  copiasTotales: number;
}

export interface ReconstituirLibroProps extends CrearLibroProps {
  copiasDisponibles: number;
}

export interface EditarLibroProps {
  titulo?: string | undefined;
  autor?: string | undefined;
  isbn?: string | undefined;
  copiasTotales?: number | undefined;
}

/**
 * Entidad Libro. Encapsula las invariantes del catálogo y del stock:
 * las copias disponibles nunca son negativas ni superan a las totales.
 */
export class Libro {
  private constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly autor: string,
    public readonly isbn: string,
    public readonly copiasTotales: number,
    private _copiasDisponibles: number,
  ) {}

  /** Crea un libro nuevo con todas sus copias disponibles. */
  static crear(props: CrearLibroProps): Libro {
    Libro.validarCampos(props);
    return new Libro(
      props.id,
      props.titulo.trim(),
      props.autor.trim(),
      props.isbn.trim(),
      props.copiasTotales,
      props.copiasTotales,
    );
  }

  /** Reconstruye un libro a partir de datos persistidos. */
  static reconstituir(props: ReconstituirLibroProps): Libro {
    Libro.validarCampos(props);
    if (
      !Number.isInteger(props.copiasDisponibles) ||
      props.copiasDisponibles < 0 ||
      props.copiasDisponibles > props.copiasTotales
    ) {
      throw new ValidationError(
        "Las copias disponibles deben estar entre 0 y las copias totales.",
      );
    }
    return new Libro(
      props.id,
      props.titulo.trim(),
      props.autor.trim(),
      props.isbn.trim(),
      props.copiasTotales,
      props.copiasDisponibles,
    );
  }

  private static validarCampos(props: CrearLibroProps): void {
    if (!props.id?.trim()) {
      throw new ValidationError("El id del libro es obligatorio.");
    }
    if (!props.titulo?.trim()) {
      throw new ValidationError("El título es obligatorio.");
    }
    if (!props.autor?.trim()) {
      throw new ValidationError("El autor es obligatorio.");
    }
    if (!props.isbn?.trim()) {
      throw new ValidationError("El ISBN es obligatorio.");
    }
    if (!Number.isInteger(props.copiasTotales) || props.copiasTotales < 0) {
      throw new ValidationError(
        "Las copias totales deben ser un entero mayor o igual a 0.",
      );
    }
  }

  get copiasDisponibles(): number {
    return this._copiasDisponibles;
  }

  estaDisponible(): boolean {
    return this._copiasDisponibles > 0;
  }

  /** Reserva una copia para un préstamo. */
  prestar(): void {
    if (!this.estaDisponible()) {
      throw new BusinessRuleError(
        `No hay copias disponibles del libro "${this.titulo}".`,
      );
    }
    this._copiasDisponibles -= 1;
  }

  /**
   * Devuelve un nuevo Libro con la metadata y/o el stock editados, preservando
   * la cantidad de copias actualmente prestadas. No permite reducir las copias
   * totales por debajo de las que están prestadas.
   */
  editar(cambios: EditarLibroProps): Libro {
    const nuevasTotales = cambios.copiasTotales ?? this.copiasTotales;
    const prestadas = this.copiasTotales - this._copiasDisponibles;
    const nuevasDisponibles = nuevasTotales - prestadas;
    if (nuevasDisponibles < 0) {
      throw new BusinessRuleError(
        "No se pueden reducir las copias totales por debajo de las prestadas.",
      );
    }
    return Libro.reconstituir({
      id: this.id,
      titulo: cambios.titulo ?? this.titulo,
      autor: cambios.autor ?? this.autor,
      isbn: cambios.isbn ?? this.isbn,
      copiasTotales: nuevasTotales,
      copiasDisponibles: nuevasDisponibles,
    });
  }

  /** Repone una copia tras una devolución. */
  devolver(): void {
    if (this._copiasDisponibles >= this.copiasTotales) {
      throw new BusinessRuleError(
        `No se pueden devolver más copias de las existentes del libro "${this.titulo}".`,
      );
    }
    this._copiasDisponibles += 1;
  }
}
