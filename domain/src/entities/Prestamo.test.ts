import { describe, it, expect } from "vitest";
import { Prestamo, EstadoPrestamo } from "./Prestamo.js";
import { ValidationError, BusinessRuleError } from "../errors/DomainError.js";

const inicio = new Date("2026-06-01T10:00:00Z");
const vencimiento = new Date("2026-06-15T10:00:00Z");

const datosValidos = {
  id: "prestamo-1",
  libroId: "libro-1",
  socioId: "user-1",
  fechaPrestamo: inicio,
  fechaVencimiento: vencimiento,
};

describe("Prestamo.crear", () => {
  it("crea un préstamo activo", () => {
    const prestamo = Prestamo.crear(datosValidos);
    expect(prestamo.id).toBe("prestamo-1");
    expect(prestamo.fechaDevolucion).toBeUndefined();
    expect(prestamo.estado(inicio)).toBe(EstadoPrestamo.ACTIVO);
  });

  it("rechaza un vencimiento anterior o igual a la fecha de préstamo", () => {
    expect(() =>
      Prestamo.crear({ ...datosValidos, fechaVencimiento: inicio }),
    ).toThrow(ValidationError);
  });

  it("calcula el vencimiento a partir de una cantidad de días", () => {
    const prestamo = Prestamo.crearPorDias({
      id: "prestamo-2",
      libroId: "libro-1",
      socioId: "user-1",
      fechaPrestamo: inicio,
      dias: 14,
    });
    expect(prestamo.fechaVencimiento.toISOString()).toBe(
      "2026-06-15T10:00:00.000Z",
    );
  });
});

describe("Prestamo.estado", () => {
  it("es ACTIVO antes del vencimiento", () => {
    const prestamo = Prestamo.crear(datosValidos);
    expect(prestamo.estado(new Date("2026-06-10T10:00:00Z"))).toBe(
      EstadoPrestamo.ACTIVO,
    );
  });

  it("es VENCIDO pasada la fecha de vencimiento sin devolver", () => {
    const prestamo = Prestamo.crear(datosValidos);
    expect(prestamo.estado(new Date("2026-06-20T10:00:00Z"))).toBe(
      EstadoPrestamo.VENCIDO,
    );
    expect(prestamo.estaVencido(new Date("2026-06-20T10:00:00Z"))).toBe(true);
  });

  it("es DEVUELTO una vez devuelto, aunque la fecha actual supere el vencimiento", () => {
    const prestamo = Prestamo.crear(datosValidos);
    prestamo.devolver(new Date("2026-06-12T10:00:00Z"));
    expect(prestamo.estado(new Date("2026-06-20T10:00:00Z"))).toBe(
      EstadoPrestamo.DEVUELTO,
    );
    expect(prestamo.estaVencido(new Date("2026-06-20T10:00:00Z"))).toBe(false);
  });
});

describe("Prestamo.devolver", () => {
  it("registra la fecha de devolución", () => {
    const prestamo = Prestamo.crear(datosValidos);
    const fecha = new Date("2026-06-12T10:00:00Z");
    prestamo.devolver(fecha);
    expect(prestamo.fechaDevolucion).toEqual(fecha);
  });

  it("no permite devolver dos veces", () => {
    const prestamo = Prestamo.crear(datosValidos);
    prestamo.devolver(new Date("2026-06-12T10:00:00Z"));
    expect(() =>
      prestamo.devolver(new Date("2026-06-13T10:00:00Z")),
    ).toThrow(BusinessRuleError);
  });

  it("rechaza una devolución anterior a la fecha de préstamo", () => {
    const prestamo = Prestamo.crear(datosValidos);
    expect(() =>
      prestamo.devolver(new Date("2026-05-30T10:00:00Z")),
    ).toThrow(ValidationError);
  });
});
