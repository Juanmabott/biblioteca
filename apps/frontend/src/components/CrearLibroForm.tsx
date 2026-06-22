import { useState, type FormEvent } from "react";
import type { CrearLibroPayload } from "../api/client.js";

export interface CrearLibroFormProps {
  onSubmit: (payload: CrearLibroPayload) => void;
  error?: string;
  cargando?: boolean;
}

const VACIO = { titulo: "", autor: "", isbn: "", copiasTotales: 1 };

/**
 * Formulario presentacional para dar de alta un libro. Gestiona sus campos y
 * delega el envío; no conoce la API. Solo se muestra a bibliotecarios.
 */
export function CrearLibroForm({
  onSubmit,
  error,
  cargando = false,
}: CrearLibroFormProps) {
  const [form, setForm] = useState(VACIO);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      titulo: form.titulo,
      autor: form.autor,
      isbn: form.isbn,
      copiasTotales: Number(form.copiasTotales),
    });
    setForm(VACIO);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
      <strong>Nuevo libro</strong>
      <label>
        Título
        <input
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          required
        />
      </label>
      <label>
        Autor
        <input
          value={form.autor}
          onChange={(e) => setForm({ ...form, autor: e.target.value })}
          required
        />
      </label>
      <label>
        ISBN
        <input
          value={form.isbn}
          onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          required
        />
      </label>
      <label>
        Copias
        <input
          type="number"
          min={0}
          value={form.copiasTotales}
          onChange={(e) =>
            setForm({ ...form, copiasTotales: Number(e.target.value) })
          }
          required
        />
      </label>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      <button type="submit" disabled={cargando}>
        {cargando ? "Guardando…" : "Agregar libro"}
      </button>
    </form>
  );
}
