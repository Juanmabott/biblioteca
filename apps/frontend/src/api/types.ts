/** Tipos que reflejan los DTOs expuestos por el backend. */

export type Rol = "BIBLIOTECARIO" | "SOCIO";
export type EstadoPrestamo = "ACTIVO" | "DEVUELTO" | "VENCIDO";

export interface UsuarioDTO {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface LibroDTO {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  copiasTotales: number;
  copiasDisponibles: number;
}

export interface PrestamoDTO {
  id: string;
  libroId: string;
  socioId: string;
  fechaPrestamo: string;
  fechaVencimiento: string;
  fechaDevolucion: string | null;
  estado: EstadoPrestamo;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioDTO;
}

/** Error que transporta el código HTTP y el mensaje del backend. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
