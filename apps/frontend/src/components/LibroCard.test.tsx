import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibroCard } from "./LibroCard.js";
import type { LibroDTO } from "../api/types.js";

const libro: LibroDTO = {
  id: "libro-1",
  titulo: "Dune",
  autor: "Frank Herbert",
  isbn: "9780441013593",
  copiasTotales: 3,
  copiasDisponibles: 2,
};

describe("LibroCard", () => {
  it("muestra título, autor y disponibilidad", () => {
    render(<LibroCard libro={libro} />);
    expect(screen.getByText("Dune")).toBeInTheDocument();
    expect(screen.getByText("Frank Herbert")).toBeInTheDocument();
    expect(screen.getByText(/2 de 3 disponibles/)).toBeInTheDocument();
  });

  it("llama a onPrestar al hacer click", async () => {
    const onPrestar = vi.fn();
    render(<LibroCard libro={libro} onPrestar={onPrestar} />);
    await userEvent.click(screen.getByRole("button", { name: "Prestar" }));
    expect(onPrestar).toHaveBeenCalledWith("libro-1");
  });

  it("deshabilita el botón si no hay copias", () => {
    render(
      <LibroCard
        libro={{ ...libro, copiasDisponibles: 0 }}
        onPrestar={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Prestar" })).toBeDisabled();
    expect(screen.getByText(/Sin copias disponibles/)).toBeInTheDocument();
  });

  it("no muestra botones en modo solo lectura", () => {
    render(<LibroCard libro={libro} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("llama a onEliminar al hacer click en Eliminar", async () => {
    const onEliminar = vi.fn();
    render(<LibroCard libro={libro} onEliminar={onEliminar} />);
    await userEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onEliminar).toHaveBeenCalledWith("libro-1");
  });
});
