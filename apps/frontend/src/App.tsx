import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth/AuthContext.js";
import { LoginForm } from "./components/LoginForm.js";
import { CatalogoList } from "./components/CatalogoList.js";
import { CrearLibroForm } from "./components/CrearLibroForm.js";
import { MisPrestamos } from "./components/MisPrestamos.js";
import { ApiError, type LibroDTO, type PrestamoDTO } from "./api/types.js";
import type { CrearLibroPayload } from "./api/client.js";

export function App() {
  const { usuario, api, login, logout, esBibliotecario } = useAuth();
  const [libros, setLibros] = useState<LibroDTO[]>([]);
  const [prestamos, setPrestamos] = useState<PrestamoDTO[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [cargando, setCargando] = useState(false);

  const cargarCatalogo = useCallback(async () => {
    try {
      setLibros(await api.listarLibros());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al cargar el catálogo.");
    }
  }, [api]);

  const cargarPrestamos = useCallback(async () => {
    if (esBibliotecario) return;
    try {
      setPrestamos(await api.misPrestamos());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al cargar tus préstamos.");
    }
  }, [api, esBibliotecario]);

  useEffect(() => {
    if (usuario) {
      void cargarCatalogo();
      void cargarPrestamos();
    }
  }, [usuario, cargarCatalogo, cargarPrestamos]);

  async function handleLogin(email: string, password: string) {
    setError(undefined);
    setCargando(true);
    try {
      await login(email, password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  async function handlePrestar(libroId: string) {
    setError(undefined);
    try {
      await api.prestar(libroId);
      await Promise.all([cargarCatalogo(), cargarPrestamos()]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo prestar el libro.");
    }
  }

  async function handleDevolver(prestamoId: string) {
    setError(undefined);
    try {
      await api.devolver(prestamoId);
      await Promise.all([cargarCatalogo(), cargarPrestamos()]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo devolver el libro.");
    }
  }

  async function handleCrear(payload: CrearLibroPayload) {
    setError(undefined);
    try {
      await api.crearLibro(payload);
      await cargarCatalogo();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear el libro.");
    }
  }

  async function handleEliminar(libroId: string) {
    setError(undefined);
    try {
      await api.eliminarLibro(libroId);
      await cargarCatalogo();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo eliminar el libro.");
    }
  }

  if (!usuario) {
    return (
      <main style={{ fontFamily: "system-ui", padding: 24 }}>
        <h1>Biblioteca</h1>
        <LoginForm onSubmit={handleLogin} error={error} cargando={cargando} />
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Catálogo</h1>
        <div>
          <span style={{ marginRight: 12 }}>
            {usuario.nombre} ({usuario.rol})
          </span>
          <button type="button" onClick={logout}>Salir</button>
        </div>
      </header>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      {esBibliotecario && (
        <section style={{ marginBottom: 24 }}>
          <CrearLibroForm onSubmit={handleCrear} />
        </section>
      )}
      <CatalogoList
        libros={libros}
        onPrestar={esBibliotecario ? undefined : handlePrestar}
        onEliminar={esBibliotecario ? handleEliminar : undefined}
      />
      {!esBibliotecario && (
        <section style={{ marginTop: 32 }}>
          <h2>Mis préstamos</h2>
          <MisPrestamos prestamos={prestamos} onDevolver={handleDevolver} />
        </section>
      )}
    </main>
  );
}
