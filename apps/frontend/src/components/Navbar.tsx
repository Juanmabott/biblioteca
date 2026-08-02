export interface NavbarProps {
  /** Usuario autenticado (si hay sesión). */
  usuario?: { nombre: string; rol: string } | undefined;
  /** True cuando se navega como invitado (solo lectura). */
  invitado?: boolean;
  onSalir?: (() => void) | undefined;
  onIrALogin?: (() => void) | undefined;
}

/** Barra de navegación superior: marca a la izquierda, sesión a la derecha. */
export function Navbar({ usuario, invitado = false, onSalir, onIrALogin }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">
          <span aria-hidden="true" className="navbar-logo">📚</span>
          Biblioteca
        </span>
        <div className="navbar-session">
          {usuario && (
            <>
              <span className="navbar-user">
                {usuario.nombre}
                <span className="navbar-rol">{usuario.rol}</span>
              </span>
              {onSalir && (
                <button type="button" onClick={onSalir}>
                  Salir
                </button>
              )}
            </>
          )}
          {!usuario && invitado && (
            <>
              <span className="navbar-user">
                Invitado
                <span className="navbar-rol">solo lectura</span>
              </span>
              {onIrALogin && (
                <button type="button" onClick={onIrALogin}>
                  Iniciar sesión
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
