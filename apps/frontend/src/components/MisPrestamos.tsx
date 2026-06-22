import type { PrestamoDTO } from "../api/types.js";

export interface MisPrestamosProps {
  prestamos: PrestamoDTO[];
  /** Devuelve un préstamo. Solo aplica a los que no están devueltos. */
  onDevolver?: (prestamoId: string) => void;
}

const colorEstado: Record<PrestamoDTO["estado"], string> = {
  ACTIVO: "#1a7f37",
  VENCIDO: "crimson",
  DEVUELTO: "#555",
};

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

/** Lista presentacional de los préstamos del socio, con opción de devolver. */
export function MisPrestamos({ prestamos, onDevolver }: MisPrestamosProps) {
  if (prestamos.length === 0) {
    return <p>No tenés préstamos.</p>;
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
      {prestamos.map((p) => (
        <li
          key={p.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div>
              Libro <code>{p.libroId}</code>{" "}
              <span style={{ color: colorEstado[p.estado], fontWeight: 600 }}>
                {p.estado}
              </span>
            </div>
            <small style={{ color: "#666" }}>
              Vence: {formatearFecha(p.fechaVencimiento)}
              {p.fechaDevolucion
                ? ` · Devuelto: ${formatearFecha(p.fechaDevolucion)}`
                : ""}
            </small>
          </div>
          {onDevolver && p.estado !== "DEVUELTO" && (
            <button type="button" onClick={() => onDevolver(p.id)}>
              Devolver
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
