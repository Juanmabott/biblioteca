import {
  ApiError,
  type LibroDTO,
  type LoginResponse,
  type PrestamoDTO,
  type UsuarioDTO,
  type Rol,
} from "./types.js";

export interface CrearLibroPayload {
  titulo: string;
  autor: string;
  isbn: string;
  copiasTotales: number;
}

/**
 * Cliente HTTP del backend. Aísla a los componentes de los detalles de red:
 * arma las URLs, inyecta el token y normaliza los errores en ApiError.
 * El token se obtiene de forma perezosa para que el mismo cliente sirva antes
 * y después del login.
 */
export class ApiClient {
  constructor(
    private readonly baseUrl: string = "/api",
    private readonly getToken: () => string | null = () => null,
  ) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = this.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const init: RequestInit = { method, headers };
    if (body !== undefined) init.body = JSON.stringify(body);

    const res = await fetch(`${this.baseUrl}${path}`, init);

    if (res.status === 204) return undefined as T;

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new ApiError(
        res.status,
        data.error ?? "Error",
        data.message ?? "Ocurrió un error.",
      );
    }
    return data as T;
  }

  // --- Auth ---
  login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>("POST", "/auth/login", { email, password });
  }
  registrar(
    nombre: string,
    email: string,
    password: string,
  ): Promise<UsuarioDTO> {
    return this.request<UsuarioDTO>("POST", "/auth/register", {
      nombre,
      email,
      password,
    });
  }

  // --- Catálogo ---
  listarLibros(): Promise<LibroDTO[]> {
    return this.request<LibroDTO[]>("GET", "/libros");
  }
  crearLibro(payload: CrearLibroPayload): Promise<LibroDTO> {
    return this.request<LibroDTO>("POST", "/libros", payload);
  }
  eliminarLibro(id: string): Promise<void> {
    return this.request<void>("DELETE", `/libros/${id}`);
  }

  // --- Préstamos ---
  misPrestamos(): Promise<PrestamoDTO[]> {
    return this.request<PrestamoDTO[]>("GET", "/prestamos/mios");
  }
  prestar(libroId: string): Promise<PrestamoDTO> {
    return this.request<PrestamoDTO>("POST", "/prestamos", { libroId });
  }
  devolver(prestamoId: string): Promise<PrestamoDTO> {
    return this.request<PrestamoDTO>(
      "POST",
      `/prestamos/${prestamoId}/devolucion`,
    );
  }
}

export type { Rol };
