import { describe, it, expect } from "vitest";
import { Usuario } from "./Usuario.js";
import { Rol, Permiso } from "./roles.js";
import { ValidationError } from "../errors/DomainError.js";

const datosValidos = {
  id: "user-1",
  nombre: "Ana Gómez",
  email: "ana@biblioteca.test",
  passwordHash: "hash::secreto",
  rol: Rol.SOCIO,
};

describe("Usuario.crear", () => {
  it("crea un usuario válido", () => {
    const usuario = Usuario.crear(datosValidos);
    expect(usuario.id).toBe("user-1");
    expect(usuario.email).toBe("ana@biblioteca.test");
    expect(usuario.rol).toBe(Rol.SOCIO);
  });

  it("normaliza el email a minúsculas y sin espacios", () => {
    const usuario = Usuario.crear({
      ...datosValidos,
      email: "  ANA@Biblioteca.TEST ",
    });
    expect(usuario.email).toBe("ana@biblioteca.test");
  });

  it("rechaza un email inválido", () => {
    expect(() => Usuario.crear({ ...datosValidos, email: "no-es-email" })).toThrow(
      ValidationError,
    );
  });

  it("rechaza un nombre vacío", () => {
    expect(() => Usuario.crear({ ...datosValidos, nombre: "  " })).toThrow(
      ValidationError,
    );
  });

  it("rechaza un passwordHash vacío", () => {
    expect(() => Usuario.crear({ ...datosValidos, passwordHash: "" })).toThrow(
      ValidationError,
    );
  });
});

describe("Usuario.tienePermiso", () => {
  it("delega en los permisos del rol", () => {
    const socio = Usuario.crear(datosValidos);
    expect(socio.tienePermiso(Permiso.VER_CATALOGO)).toBe(true);
    expect(socio.tienePermiso(Permiso.GESTIONAR_LIBROS)).toBe(false);

    const bibliotecario = Usuario.crear({
      ...datosValidos,
      id: "user-2",
      rol: Rol.BIBLIOTECARIO,
    });
    expect(bibliotecario.tienePermiso(Permiso.GESTIONAR_LIBROS)).toBe(true);
  });
});
