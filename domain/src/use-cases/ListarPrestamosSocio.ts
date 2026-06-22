import type { Prestamo } from "../entities/Prestamo.js";
import type { PrestamoRepository } from "../services/repositories.js";

export interface ListarPrestamosSocioInput {
  socioId: string;
}

/**
 * Caso de uso: listar todos los préstamos de un socio (activos, vencidos y
 * devueltos), para que pueda ver su historial y gestionar sus devoluciones.
 */
export class ListarPrestamosSocio {
  constructor(private readonly repos: { prestamos: PrestamoRepository }) {}

  async ejecutar(input: ListarPrestamosSocioInput): Promise<Prestamo[]> {
    return this.repos.prestamos.findBySocio(input.socioId);
  }
}
