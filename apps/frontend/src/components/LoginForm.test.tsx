import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm.js";

describe("LoginForm", () => {
  it("envía email y contraseña ingresados", async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("Email"), "ana@biblioteca.test");
    await userEvent.type(screen.getByLabelText("Contraseña"), "secreto123");
    await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(onSubmit).toHaveBeenCalledWith("ana@biblioteca.test", "secreto123");
  });

  it("muestra el mensaje de error", () => {
    render(<LoginForm onSubmit={() => {}} error="Credenciales inválidas" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Credenciales inválidas");
  });

  it("deshabilita el botón mientras carga", () => {
    render(<LoginForm onSubmit={() => {}} cargando />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
