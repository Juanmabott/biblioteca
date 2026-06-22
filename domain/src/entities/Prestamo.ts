import { ValidationError, BusinessRuleError } from "../errors/DomainError.js";

export const EstadoPrestamo = {
  ACTIVO: "ACTIVO",
  DEVUELTO: "DEVUELTO",
  VENCIDO: "VENCIDO",
} as const;

export type EstadoPrestamo =
  (typeof EstadoPrestamo)[keyof typeof EstadoPrestamo];

export interface CrearPrestamoProps {
  id: string;
  libroId: string;
  socioId: string;
  fechaPrestamo: Date;
  fechaVencimiento: Date;
}

export interface CrearPrestamoPorDiasProps {
  id: string;
  libroId: string;
  socioId: string;
  fechaPrestamo: Date;
  dias: number;
}

export interface ReconstituirPrestamoProps extends CrearPrestamoProps {
  fechaDevolucion?: Date;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Entidad Prestamo. Relaciona un libro con un socio durante un período.
 * El estado (ACTIVO/VENCIDO/DEVUELTO) se deriva de las fechas y de una fecha
 * de referencia que se pasa explícitamente, manteniendo la entidad pura.
 */
export class Prestamo {
  private constructor(
    public readonly id: string,
    public readonly libroId: string,
    public readonly socioId: string,
    public readonly fechaPrestamo: Date,
    public readonly fechaVencimiento: Date,
    private _fechaDevolucion?: Date,
  ) {}

  static crear(props: CrearPrestamoProps): Prestamo {
    Prestamo.validarCampos(props);
    if (props.fechaVencimiento.getTime() <= props.fechaPrestamo.getTime()) {
      throw new ValidationError(
        "La fecha de vencimiento debe ser posterior a la fecha de préstamo.",
      );
    }
    return new Prestamo(
      props.id,
      props.libroId,
      props.socioId,
      props.fechaPrestamo,
      props.fechaVencimiento,
    );
  }

  /** Crea un préstamo calculando el vencimiento a N días de la fecha de préstamo. */
  static crearPorDias(props: CrearPrestamoPorDiasProps): Prestamo {
    if (!Number.isInteger(props.dias) || props.dias <= 0) {
      throw new ValidationError(
        "La cantidad de días del préstamo debe ser un entero positivo.",
      );
    }
    const fechaVencimiento = new Date(
      props.fechaPrestamo.getTime() + props.dias * MS_POR_DIA,
    );
    return Prestamo.crear({
      id: props.id,
      libroId: props.libroId,
      socioId: props.socioId,
      fechaPrestamo: props.fechaPrestamo,
      fechaVencimiento,
    });
  }

  static reconstituir(props: ReconstituirPrestamoProps): Prestamo {
    const prestamo = Prestamo.crear(props);
    if (props.fechaDevolucion) {
      prestamo._fechaDevolucion = props.fechaDevolucion;
    }
    return prestamo;
  }

  private static validarCampos(props: CrearPrestamoProps): void {
    if (!props.id?.trim()) {
      throw new ValidationError("El id del préstamo es obligatorio.");
    }
    if (!props.libroId?.trim()) {
      throw new ValidationError("El libroId es obligatorio.");
    }
    if (!props.socioId?.trim()) {
      throw new ValidationError("El socioId es obligatorio.");
    }
  }

  get fechaDevolucion(): Date | undefined {
    return this._fechaDevolucion;
  }

  estaDevuelto(): boolean {
    return this._fechaDevolucion !== undefined;
  }

  estaVencido(ahora: Date): boolean {
    return !this.estaDevuelto() && ahora.getTime() > this.fechaVencimiento.getTime();
  }

  estado(ahora: Date): EstadoPrestamo {
    if (this.estaDevuelto()) return EstadoPrestamo.DEVUELTO;
    if (this.estaVencido(ahora)) return EstadoPrestamo.VENCIDO;
    return EstadoPrestamo.ACTIVO;
  }

  devolver(fecha: Date): void {
    if (this.estaDevuelto()) {
      throw new BusinessRuleError("El préstamo ya fue devuelto.");
    }
    if (fecha.getTime() < this.fechaPrestamo.getTime()) {
      throw new ValidationError(
        "La fecha de devolución no puede ser anterior a la del préstamo.",
      );
    }
    this._fechaDevolucion = fecha;
  }
}
