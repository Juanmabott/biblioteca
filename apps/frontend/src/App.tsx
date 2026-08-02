import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth/AuthContext.js";
import { LoginForm } from "./components/LoginForm.js";
import { Navbar } from "./components/Navbar.js";
import { CatalogoList } from "./components/CatalogoList.js";
import { CrearLibroForm } from "./components/CrearLibroForm.js";
import { MisPrestamos } from "./components/MisPrestamos.js";
import { ApiError, type LibroDTO, type PrestamoDTO } from "./api/types.js";
import type { CrearLibroPayload } from "./api/client.js";

export function App() {
  const { usuario, api, login, logout, esBibliotecario } = useAuth();
  const [modoInvitado, setModoInvitado] = useState(false);
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
    } else if (modoInvitado) {
      void cargarCatalogo();
    }
  }, [usuario, modoInvitado, cargarCatalogo, cargarPrestamos]);

  async function handleLogin(email: string, password: string) {
    setError(undefined);
    setCargando(true);
    try {
      await login(email, password);
      setModoInvitado(false);
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

  // --- Vista de login (sin sesión ni modo invitado) ---
  if (!usuario && !modoInvitado) {
    return (
      <>
        <Navbar />
        <main className="login-page">
          <div className="login-card">
            <h1>Bienvenido</h1>
            <p className="login-subtitulo">
              Ingresá con tu cuenta para gestionar préstamos.
            </p>
            <LoginForm onSubmit={handleLogin} error={error} cargando={cargando} />
            <div className="login-separador">
              <span>o</span>
            </div>
            <button
              type="button"
              className="boton-invitado"
              onClick={() => {
                setError(undefined);
                setModoInvitado(true);
              }}
            >
              Explorar el catálogo como invitado
            </button>
          </div>
        </main>
      </>
    );
  }

  // --- Vista de invitado (catálogo solo lectura) ---
  if (!usuario) {
    return (
      <>
        <Navbar
          invitado
          onIrALogin={() => {
            setError(undefined);
            setModoInvitado(false);
          }}
        />
        <main className="contenido">
          <header className="contenido-header">
            <h1>Catálogo</h1>
            <p className="contenido-subtitulo">
              Estás navegando como invitado. Iniciá sesión para pedir libros
              prestados.
            </p>
          </header>
          {error && <p role="alert">{error}</p>}
          <CatalogoList libros={libros} />
        </main>
      </>
    );
  }

  // --- Vista autenticada ---
  return (
    <>
      <Navbar usuario={usuario} onSalir={logout} />
      <main className="contenido">
        <header className="contenido-header">
          <h1>Catálogo</h1>
        </header>
        {error && <p role="alert">{error}</p>}
        {esBibliotecario && (
          <section className="panel">
            <CrearLibroForm onSubmit={handleCrear} />
          </section>
        )}
        <CatalogoList
          libros={libros}
          onPrestar={esBibliotecario ? undefined : handlePrestar}
          onEliminar={esBibliotecario ? handleEliminar : undefined}
        />
        {!esBibliotecario && (
          <section className="panel seccion-prestamos">
            <h2>Mis préstamos</h2>
            <MisPrestamos prestamos={prestamos} onDevolver={handleDevolver} />
          </section>
        )}
      </main>
    </>
  );
}
