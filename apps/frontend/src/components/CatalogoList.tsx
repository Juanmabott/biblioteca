import type { LibroDTO } from "../api/types.js";
import { LibroCard } from "./LibroCard.js";

export interface CatalogoListProps {
  libros: LibroDTO[];
  onPrestar?: ((libroId: string) => void) | undefined;
  onEliminar?: ((libroId: string) => void) | undefined;
}

/** Lista presentacional del catálogo. Compone LibroCard. */
export function CatalogoList({ libros, onPrestar, onEliminar }: CatalogoListProps) {
  if (libros.length === 0) {
    return <p>No hay libros en el catálogo.</p>;
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      {libros.map((libro) => (
        <LibroCard
          key={libro.id}
          libro={libro}
          onPrestar={onPrestar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
