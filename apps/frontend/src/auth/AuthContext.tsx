import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ApiClient } from "../api/client.js";
import type { UsuarioDTO } from "../api/types.js";

interface AuthState {
  usuario: UsuarioDTO | null;
  api: ApiClient;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  esBibliotecario: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Proveedor de autenticación. Mantiene el token y el usuario en memoria y
 * construye un ApiClient que inyecta el token en cada request. (En producción
 * convendría persistir el token de forma segura; acá se mantiene en memoria.)
 */
export function AuthProvider({
  children,
  baseUrl = "/api",
}: {
  children: ReactNode;
  baseUrl?: string;
}) {
  const tokenRef = useRef<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioDTO | null>(null);

  const api = useMemo(
    () => new ApiClient(baseUrl, () => tokenRef.current),
    [baseUrl],
  );

  const value = useMemo<AuthState>(
    () => ({
      usuario,
      api,
      esBibliotecario: usuario?.rol === "BIBLIOTECARIO",
      async login(email, password) {
        const res = await api.login(email, password);
        tokenRef.current = res.token;
        setUsuario(res.usuario);
      },
      logout() {
        tokenRef.current = null;
        setUsuario(null);
      },
    }),
    [api, usuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return ctx;
}
