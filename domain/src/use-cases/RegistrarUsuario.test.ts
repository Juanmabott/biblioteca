import { describe, it, expect, beforeEach } from "vitest";
import { RegistrarUsuario } from "./RegistrarUsuario.js";
import { Usuario } from "../entities/Usuario.js";
import { Rol } from "../entities/roles.js";
import { ValidationError, ConflictError } from "../errors/DomainError.js";
import {
  InMemoryUsuarioRepository,
  SequentialIdGenerator,
  FakePasswordHasher,
} from "../__test-support__/fakes.js";

describe("RegistrarUsuario", () => {
  let usuarios: InMemoryUsuarioRepository;
  let hasher: FakePasswordHasher;
  let registrar: RegistrarUsuario;

  beforeEach(() => {
    usuarios = new InMemoryUsuarioRepository();
    hasher = new FakePasswordHasher();
    registrar = new RegistrarUsuario(
      { usuarios },
      { hasher, idGen: new SequentialIdGenerator("user"), minPasswordLength: 8 },
    );
  });

  it("registra un usuario hasheando la contraseña", async () => {
    const usuario = await registrar.ejecutar({
      nombre: "Ana",
      email: "ana@biblioteca.test",
      password: "secreto123",
      rol: Rol.SOCIO,
    });

    expect(usuario).toBeInstanceOf(Usuario);
    expect(usuario.email).toBe("ana@biblioteca.test");
    expect(usuario.passwordHash).toBe("hash::secreto123");
    expect(await usuarios.findByEmail("ana@biblioteca.test")).not.toBeNull();
  });

  it("rechaza una contraseña demasiado corta", async () => {
    await expect(
      registrar.ejecutar({
        nombre: "Ana",
        email: "ana@biblioteca.test",
        password: "corta",
        rol: Rol.SOCIO,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("rechaza un email ya registrado", async () => {
    await registrar.ejecutar({
      nombre: "Ana",
      email: "ana@biblioteca.test",
      password: "secreto123",
      rol: Rol.SOCIO,
    });
    await expect(
      registrar.ejecutar({
        nombre: "Otra Ana",
        email: "ANA@biblioteca.test",
        password: "secreto123",
        rol: Rol.SOCIO,
      }),
    ).rejects.toThrow(ConflictError);
  });
});
