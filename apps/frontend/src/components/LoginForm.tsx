import { useState, type FormEvent } from "react";

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  /** Mensaje de error a mostrar (p. ej. credenciales inválidas). */
  error?: string | undefined;
  cargando?: boolean | undefined;
}

/** Formulario de login presentacional: gestiona sus campos y delega el envío. */
export function LoginForm({ onSubmit, error, cargando = false }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(email, password);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 280 }}>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      <button type="submit" disabled={cargando}>
        {cargando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
