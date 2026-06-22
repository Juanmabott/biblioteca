import { describe, it, expect, beforeEach } from "vitest";
import { AutenticarUsuario } from "./AutenticarUsuario.js";
import { Usuario } from "../entities/Usuario.js";
import { Rol } from "../entities/roles.js";
import { AuthenticationError } from "../errors/DomainError.js";
import {
  InMemoryUsuarioRepository,
  FakePasswordHasher,
} from "../__test-support__/fakes.js";

describe("AutenticarUsuario", () => {
  let usuarios: InMemoryUsuarioRepository;
  let autenticar: AutenticarUsuario;

  beforeEach(async () => {
    const hasher = new FakePasswordHasher();
    usuarios = new InMemoryUsuarioRepository([
      Usuario.crear({
        id: "user-1",
        nombre: "Ana",
        email: "ana@biblioteca.test",
        passwordHash: await hasher.hash("secreto123"),
        rol: Rol.SOCIO,
      }),
    ]);
    autenticar = new AutenticarUsuario({ usuarios }, { hasher });
  });

  it("devuelve el usuario con credenciales válidas", async () => {
    const usuario = await autenticar.ejecutar({
      email: "ana@biblioteca.test",
      password: "secreto123",
    });
    expect(usuario.id).toBe("user-1");
  });

  it("acepta el email con distinta capitalización", async () => {
    const usuario = await autenticar.ejecutar({
      email: "ANA@Biblioteca.test",
      password: "secreto123",
    });
    expect(usuario.id).toBe("user-1");
  });

  it("falla con contraseña incorrecta", async () => {
    await expect(
      autenticar.ejecutar({
        email: "ana@biblioteca.test",
        password: "incorrecta",
      }),
    ).rejects.toThrow(AuthenticationError);
  });

  it("falla con email inexistente (mismo error, sin filtrar información)", async () => {
    await expect(
      autenticar.ejecutar({
        email: "nadie@biblioteca.test",
        password: "secreto123",
      }),
    ).rejects.toThrow(AuthenticationError);
  });
});
