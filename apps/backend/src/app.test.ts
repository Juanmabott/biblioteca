import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { Rol } from "@biblioteca/domain";
import { loadConfig } from "./config.js";
import { createContainer, type Container } from "./container.js";
import { createApp } from "./app.js";

function buildApp() {
  // bcrypt con pocas rondas para que los tests sean rápidos.
  const config = loadConfig({
    JWT_SECRET: "test-secret",
    BCRYPT_ROUNDS: "4",
  } as NodeJS.ProcessEnv);
  const container = createContainer(config);
  return { app: createApp(container), container, config };
}

async function seedAdmin(container: Container) {
  await container.registrarUsuario.ejecutar({
    nombre: "Admin",
    email: "admin@biblioteca.test",
    password: "admin12345",
    rol: Rol.BIBLIOTECARIO,
  });
}

async function login(app: ReturnType<typeof buildApp>["app"], email: string, password: string) {
  const res = await request(app).post("/auth/login").send({ email, password });
  return res.body.token as string;
}

describe("API de biblioteca", () => {
  let app: ReturnType<typeof buildApp>["app"];
  let container: Container;

  beforeEach(async () => {
    ({ app, container } = buildApp());
    await seedAdmin(container);
  });

  it("GET /health responde ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("permite ver el catálogo sin token (modo invitado)", async () => {
    const res = await request(app).get("/libros");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("rechaza crear libros sin token", async () => {
    const res = await request(app)
      .post("/libros")
      .send({ titulo: "X", autor: "Y", isbn: "isbn-x", copiasTotales: 1 });
    expect(res.status).toBe(401);
  });

  it("el bibliotecario crea un libro y el socio lo toma prestado", async () => {
    const tokenAdmin = await login(app, "admin@biblioteca.test", "admin12345");

    const creado = await request(app)
      .post("/libros")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ titulo: "Dune", autor: "Frank Herbert", isbn: "isbn-1", copiasTotales: 2 });
    expect(creado.status).toBe(201);
    const libroId = creado.body.id;

    await request(app)
      .post("/auth/register")
      .send({ nombre: "Ana", email: "ana@biblioteca.test", password: "ana1234567" })
      .expect(201);

    const tokenSocio = await login(app, "ana@biblioteca.test", "ana1234567");

    const prestamo = await request(app)
      .post("/prestamos")
      .set("Authorization", `Bearer ${tokenSocio}`)
      .send({ libroId });
    expect(prestamo.status).toBe(201);
    expect(prestamo.body.estado).toBe("ACTIVO");

    const listado = await request(app)
      .get("/libros")
      .set("Authorization", `Bearer ${tokenSocio}`);
    expect(listado.body[0].copiasDisponibles).toBe(1);

    const devolucion = await request(app)
      .post(`/prestamos/${prestamo.body.id}/devolucion`)
      .set("Authorization", `Bearer ${tokenSocio}`);
    expect(devolucion.status).toBe(200);
    expect(devolucion.body.estado).toBe("DEVUELTO");
  });

  it("un socio no puede crear libros (403)", async () => {
    await request(app)
      .post("/auth/register")
      .send({ nombre: "Ana", email: "ana@biblioteca.test", password: "ana1234567" })
      .expect(201);
    const tokenSocio = await login(app, "ana@biblioteca.test", "ana1234567");

    const res = await request(app)
      .post("/libros")
      .set("Authorization", `Bearer ${tokenSocio}`)
      .send({ titulo: "X", autor: "Y", isbn: "isbn-x", copiasTotales: 1 });
    expect(res.status).toBe(403);
  });

  it("login con credenciales inválidas devuelve 401", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "admin@biblioteca.test", password: "incorrecta" });
    expect(res.status).toBe(401);
  });
});
