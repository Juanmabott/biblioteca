import { describe, it, expect } from "vitest";
import { ListarPrestamosSocio } from "./ListarPrestamosSocio.js";
import { Prestamo } from "../entities/Prestamo.js";
import { InMemoryPrestamoRepository } from "../__test-support__/fakes.js";

function prestamo(id: string, socioId: string) {
  return Prestamo.crear({
    id,
    libroId: `libro-${id}`,
    socioId,
    fechaPrestamo: new Date("2026-06-01T10:00:00Z"),
    fechaVencimiento: new Date("2026-06-15T10:00:00Z"),
  });
}

describe("ListarPrestamosSocio", () => {
  it("devuelve solo los préstamos del socio indicado", async () => {
    const prestamos = new InMemoryPrestamoRepository([
      prestamo("1", "socio-1"),
      prestamo("2", "socio-2"),
      prestamo("3", "socio-1"),
    ]);
    const listar = new ListarPrestamosSocio({ prestamos });

    const resultado = await listar.ejecutar({ socioId: "socio-1" });

    expect(resultado).toHaveLength(2);
    expect(resultado.map((p) => p.id).sort()).toEqual(["1", "3"]);
  });

  it("incluye los préstamos ya devueltos", async () => {
    const devuelto = prestamo("1", "socio-1");
    devuelto.devolver(new Date("2026-06-10T10:00:00Z"));
    const prestamos = new InMemoryPrestamoRepository([devuelto]);
    const listar = new ListarPrestamosSocio({ prestamos });

    const resultado = await listar.ejecutar({ socioId: "socio-1" });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].estaDevuelto()).toBe(true);
  });
});
