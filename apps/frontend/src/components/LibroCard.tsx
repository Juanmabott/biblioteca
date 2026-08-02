import type { LibroDTO } from "../api/types.js";

export interface LibroCardProps {
  libro: LibroDTO;
  /** Si se provee, muestra el botón de préstamo (vista de socio). */
  onPrestar?: ((libroId: string) => void) | undefined;
  /** Si se provee, muestra el botón de eliminación (vista de bibliotecario). */
  onEliminar?: ((libroId: string) => void) | undefined;
}

/**
 * Componente presentacional: muestra un libro del catálogo y, opcionalmente,
 * permite tomarlo prestado. No conoce la API ni el estado global; recibe datos
 * y callbacks por props (testeable de forma aislada en Storybook).
 */
export function LibroCard({ libro, onPrestar, onEliminar }: LibroCardProps) {
  const disponible = libro.copiasDisponibles > 0;

  return (
    <article className="libro-card">
      <h3 style={{ margin: "0 0 4px" }}>{libro.titulo}</h3>
      <p style={{ margin: "0 0 8px", color: "#555" }}>{libro.autor}</p>
      <p style={{ margin: "0 0 12px", fontSize: 14 }}>
        {disponible
          ? `${libro.copiasDisponibles} de ${libro.copiasTotales} disponibles`
          : "Sin copias disponibles"}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        {onPrestar && (
          <button
            type="button"
            disabled={!disponible}
            onClick={() => onPrestar(libro.id)}
          >
            Prestar
          </button>
        )}
        {onEliminar && (
          <button type="button" onClick={() => onEliminar(libro.id)}>
            Eliminar
          </button>
        )}
      </div>
    </article>
  );
}
