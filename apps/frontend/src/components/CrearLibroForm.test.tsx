import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CrearLibroForm } from "./CrearLibroForm.js";

describe("CrearLibroForm", () => {
  it("envía el payload con los datos cargados", async () => {
    const onSubmit = vi.fn();
    render(<CrearLibroForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("Título"), "Dune");
    await userEvent.type(screen.getByLabelText("Autor"), "Frank Herbert");
    await userEvent.type(screen.getByLabelText("ISBN"), "isbn-1");
    const copias = screen.getByLabelText("Copias");
    await userEvent.clear(copias);
    await userEvent.type(copias, "3");
    await userEvent.click(screen.getByRole("button", { name: "Agregar libro" }));

    expect(onSubmit).toHaveBeenCalledWith({
      titulo: "Dune",
      autor: "Frank Herbert",
      isbn: "isbn-1",
      copiasTotales: 3,
    });
  });

  it("muestra el error recibido", () => {
    render(<CrearLibroForm onSubmit={() => {}} error="ISBN duplicado" />);
    expect(screen.getByRole("alert")).toHaveTextContent("ISBN duplicado");
  });
});
