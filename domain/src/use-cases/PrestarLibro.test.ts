import { describe, it, expect, beforeEach } from "vitest";
import { PrestarLibro } from "./PrestarLibro.js";
import { Libro } from "../entities/Libro.js";
import { Usuario } from "../entities/Usuario.js";
import { Prestamo } from "../entities/Prestamo.js";
import { Rol } from "../entities/roles.js";
import {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../errors/DomainError.js";
import {
  InMemoryLibroRepository,
  InMemoryUsuarioRepository,
  InMemoryPrestamoRepository,
  FixedClock,
  SequentialIdGenerator,
} from "../__test-support__/fakes.js";

const HOY = new Date("2026-06-01T10:00:00Z");

function socio(id = "socio-1") {
  return Usuario.crear({
    id,
    nombre: "Ana",
    email: `${id}@biblioteca.test`,
    passwordHash: "hash::x",
    rol: Rol.SOCIO,
  });
}

function libro(id = "libro-1", copias = 2) {
  return Libro.crear({
    id,
    titulo: "Dune",
    autor: "Frank Herbert",
    isbn: `isbn-${id}`,
    copiasTotales: copias,
  });
}

describe("PrestarLibro", () => {
  let libros: InMemoryLibroRepository;
  let usuarios: InMemoryUsuarioRepository;
  let prestamos: InMemoryPrestamoRepository;
  let clock: FixedClock;
  let prestar: PrestarLibro;

  beforeEach(() => {
    libros = new InMemoryLibroRepository([libro()]);
    usuarios = new InMemoryUsuarioRepository([socio()]);
    prestamos = new InMemoryPrestamoRepository();
    clock = new FixedClock(HOY);
    prestar = new PrestarLibro(
      { libros, usuarios, prestamos },
      { clock, idGen: new SequentialIdGenerator("prestamo"), diasPrestamo: 14, maxPrestamosActivos: 3 },
    );
  });

  it("crea un préstamo y descuenta una copia disponible", async () => {
    const prestamo = await prestar.ejecutar({ socioId: "socio-1", libroId: "libro-1" });

    expect(prestamo.libroId).toBe("libro-1");
    expect(prestamo.socioId).toBe("socio-1");
    expect(prestamo.fechaVencimiento.toISOString()).toBe("2026-06-15T10:00:00.000Z");

    const libroGuardado = await libros.findById("libro-1");
    expect(libroGuardado?.copiasDisponibles).toBe(1);
    expect(await prestamos.findById(prestamo.id)).not.toBeNull();
  });

  it("falla si el socio no existe", async () => {
    await expect(
      prestar.ejecutar({ socioId: "fantasma", libroId: "libro-1" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("falla si el libro no existe", async () => {
    await expect(
      prestar.ejecutar({ socioId: "socio-1", libroId: "fantasma" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("falla si el usuario no tiene permiso para prestar", async () => {
    // Un usuario sin el permiso PRESTAR_LIBRO: simulamos con un rol sin ese permiso
    // creando un usuario y quitándole el permiso vía rol. Aquí usamos BIBLIOTECARIO
    // que SÍ tiene permiso, por lo que probamos el caso negativo con un doble:
    const sinPermiso = {
      ...socio("socio-2"),
      tienePermiso: () => false,
    } as unknown as Usuario;
    await usuarios.save(sinPermiso);
    await expect(
      prestar.ejecutar({ socioId: "socio-2", libroId: "libro-1" }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("falla si no hay copias disponibles", async () => {
    await libros.save(libro("libro-1", 0));
    await expect(
      prestar.ejecutar({ socioId: "socio-1", libroId: "libro-1" }),
    ).rejects.toThrow(BusinessRuleError);
  });

  it("falla si el socio alcanzó el límite de préstamos activos", async () => {
    for (let i = 1; i <= 3; i++) {
      await prestamos.save(
        Prestamo.crearPorDias({
          id: `previo-${i}`,
          libroId: `otro-${i}`,
          socioId: "socio-1",
          fechaPrestamo: HOY,
          dias: 14,
        }),
      );
    }
    await expect(
      prestar.ejecutar({ socioId: "socio-1", libroId: "libro-1" }),
    ).rejects.toThrow(BusinessRuleError);
  });

  it("falla si el socio tiene un préstamo vencido", async () => {
    await prestamos.save(
      Prestamo.crear({
        id: "vencido-1",
        libroId: "otro-1",
        socioId: "socio-1",
        fechaPrestamo: new Date("2026-05-01T10:00:00Z"),
        fechaVencimiento: new Date("2026-05-15T10:00:00Z"),
      }),
    );
    await expect(
      prestar.ejecutar({ socioId: "socio-1", libroId: "libro-1" }),
    ).rejects.toThrow(BusinessRuleError);
  });
});
