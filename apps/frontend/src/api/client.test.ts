import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiClient } from "./client.js";

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("ApiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hace login y devuelve token + usuario", async () => {
    const fetchMock = mockFetch(200, {
      token: "jwt-123",
      usuario: { id: "u1", nombre: "Ana", email: "ana@t", rol: "SOCIO" },
    });
    vi.stubGlobal("fetch", fetchMock);

    const api = new ApiClient("/api");
    const res = await api.login("ana@t", "secreto123");

    expect(res.token).toBe("jwt-123");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("inyecta el token en el header Authorization", async () => {
    const fetchMock = mockFetch(200, []);
    vi.stubGlobal("fetch", fetchMock);

    const api = new ApiClient("/api", () => "jwt-123");
    await api.listarLibros();

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["Authorization"]).toBe("Bearer jwt-123");
  });

  it("convierte una respuesta de error en ApiError", async () => {
    const fetchMock = mockFetch(403, {
      error: "ForbiddenError",
      message: "Sin permiso",
    });
    vi.stubGlobal("fetch", fetchMock);

    const api = new ApiClient("/api", () => "jwt-123");
    await expect(
      api.crearLibro({ titulo: "X", autor: "Y", isbn: "z", copiasTotales: 1 }),
    ).rejects.toMatchObject({ status: 403, code: "ForbiddenError" });
  });

  it("maneja respuestas 204 sin cuerpo", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error("sin cuerpo");
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const api = new ApiClient("/api", () => "jwt-123");
    await expect(api.eliminarLibro("libro-1")).resolves.toBeUndefined();
  });
});
