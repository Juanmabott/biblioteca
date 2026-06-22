import { describe, it, expect, beforeEach } from "vitest";
import { DevolverLibro } from "./DevolverLibro.js";
import { Libro } from "../entities/Libro.js";
import { Prestamo } from "../entities/Prestamo.js";
import { NotFoundError, BusinessRuleError } from "../errors/DomainError.js";
import {
  InMemoryLibroRepository,
  InMemoryPrestamoRepository,
  FixedClock,
} from "../__test-support__/fakes.js";

const HOY = new Date("2026-06-10T10:00:00Z");

function libroPrestado() {
  const libro = Libro.crear({
    id: "libro-1",
    titulo: "Dune",
    autor: "Frank Herbert",
    isbn: "isbn-1",
    copiasTotales: 2,
  });
  libro.prestar(); // queda 1 disponible
  return libro;
}

function prestamoActivo() {
  return Prestamo.crear({
    id: "prestamo-1",
    libroId: "libro-1",
    socioId: "socio-1",
    fechaPrestamo: new Date("2026-06-01T10:00:00Z"),
    fechaVencimiento: new Date("2026-06-15T10:00:00Z"),
  });
}

describe("DevolverLibro", () => {
  let libros: InMemoryLibroRepository;
  let prestamos: InMemoryPrestamoRepository;
  let devolver: DevolverLibro;

  beforeEach(() => {
    libros = new InMemoryLibroRepository([libroPrestado()]);
    prestamos = new InMemoryPrestamoRepository([prestamoActivo()]);
    devolver = new DevolverLibro(
      { libros, prestamos },
      { clock: new FixedClock(HOY) },
    );
  });

  it("registra la devolución y repone la copia", async () => {
    const prestamo = await devolver.ejecutar({ prestamoId: "prestamo-1" });

    expect(prestamo.estaDevuelto()).toBe(true);
    expect(prestamo.fechaDevolucion).toEqual(HOY);
    expect((await libros.findById("libro-1"))?.copiasDisponibles).toBe(2);
  });

  it("falla si el préstamo no existe", async () => {
    await expect(
      devolver.ejecutar({ prestamoId: "fantasma" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("falla si el préstamo ya fue devuelto", async () => {
    await devolver.ejecutar({ prestamoId: "prestamo-1" });
    await expect(
      devolver.ejecutar({ prestamoId: "prestamo-1" }),
    ).rejects.toThrow(BusinessRuleError);
  });

  it("falla si el libro asociado no existe", async () => {
    await libros.delete("libro-1");
    await expect(
      devolver.ejecutar({ prestamoId: "prestamo-1" }),
    ).rejects.toThrow(NotFoundError);
  });
});
