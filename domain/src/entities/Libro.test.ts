import { describe, it, expect } from "vitest";
import { Libro } from "./Libro.js";
import { ValidationError, BusinessRuleError } from "../errors/DomainError.js";

const datosValidos = {
  id: "libro-1",
  titulo: "El nombre del viento",
  autor: "Patrick Rothfuss",
  isbn: "9788401352836",
  copiasTotales: 3,
};

describe("Libro.crear", () => {
  it("crea un libro válido con todas las copias disponibles", () => {
    const libro = Libro.crear(datosValidos);

    expect(libro.id).toBe("libro-1");
    expect(libro.titulo).toBe("El nombre del viento");
    expect(libro.copiasTotales).toBe(3);
    expect(libro.copiasDisponibles).toBe(3);
    expect(libro.estaDisponible()).toBe(true);
  });

  it("rechaza un título vacío", () => {
    expect(() => Libro.crear({ ...datosValidos, titulo: "  " })).toThrow(
      ValidationError,
    );
  });

  it("rechaza un ISBN vacío", () => {
    expect(() => Libro.crear({ ...datosValidos, isbn: "" })).toThrow(
      ValidationError,
    );
  });

  it("rechaza una cantidad de copias negativa", () => {
    expect(() => Libro.crear({ ...datosValidos, copiasTotales: -1 })).toThrow(
      ValidationError,
    );
  });

  it("permite un libro con 0 copias (no disponible)", () => {
    const libro = Libro.crear({ ...datosValidos, copiasTotales: 0 });
    expect(libro.estaDisponible()).toBe(false);
  });
});

describe("Libro.prestar", () => {
  it("descuenta una copia disponible al prestar", () => {
    const libro = Libro.crear(datosValidos);
    libro.prestar();
    expect(libro.copiasDisponibles).toBe(2);
  });

  it("lanza error al prestar sin copias disponibles", () => {
    const libro = Libro.crear({ ...datosValidos, copiasTotales: 1 });
    libro.prestar();
    expect(() => libro.prestar()).toThrow(BusinessRuleError);
  });
});

describe("Libro.devolver", () => {
  it("repone una copia al devolver", () => {
    const libro = Libro.crear(datosValidos);
    libro.prestar();
    libro.devolver();
    expect(libro.copiasDisponibles).toBe(3);
  });

  it("no permite devolver más copias de las que existen", () => {
    const libro = Libro.crear(datosValidos);
    expect(() => libro.devolver()).toThrow(BusinessRuleError);
  });
});

describe("Libro.editar", () => {
  it("actualiza la metadata sin tocar el stock", () => {
    const libro = Libro.crear(datosValidos);
    const editado = libro.editar({ titulo: "Otro título", autor: "Otro autor" });
    expect(editado.titulo).toBe("Otro título");
    expect(editado.autor).toBe("Otro autor");
    expect(editado.copiasTotales).toBe(3);
    expect(editado.copiasDisponibles).toBe(3);
  });

  it("ajusta las copias disponibles al aumentar las totales, preservando las prestadas", () => {
    const libro = Libro.crear(datosValidos);
    libro.prestar(); // 1 prestada -> 2 disponibles de 3
    const editado = libro.editar({ copiasTotales: 5 });
    expect(editado.copiasTotales).toBe(5);
    expect(editado.copiasDisponibles).toBe(4); // 5 - 1 prestada
  });

  it("no permite reducir las totales por debajo de las prestadas", () => {
    const libro = Libro.crear(datosValidos);
    libro.prestar();
    libro.prestar(); // 2 prestadas
    expect(() => libro.editar({ copiasTotales: 1 })).toThrow(BusinessRuleError);
  });
});

describe("Libro.reconstituir", () => {
  it("reconstruye un libro desde persistencia respetando las copias disponibles", () => {
    const libro = Libro.reconstituir({ ...datosValidos, copiasDisponibles: 1 });
    expect(libro.copiasDisponibles).toBe(1);
    expect(libro.copiasTotales).toBe(3);
  });

  it("rechaza copias disponibles mayores que las totales", () => {
    expect(() =>
      Libro.reconstituir({ ...datosValidos, copiasDisponibles: 5 }),
    ).toThrow(ValidationError);
  });
});
