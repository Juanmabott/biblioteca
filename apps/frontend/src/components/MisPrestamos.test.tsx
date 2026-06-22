import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MisPrestamos } from "./MisPrestamos.js";
import type { PrestamoDTO } from "../api/types.js";

function prestamo(over: Partial<PrestamoDTO>): PrestamoDTO {
  return {
    id: "p1",
    libroId: "libro-1",
    socioId: "socio-1",
    fechaPrestamo: "2026-06-01T10:00:00.000Z",
    fechaVencimiento: "2026-06-15T10:00:00.000Z",
    fechaDevolucion: null,
    estado: "ACTIVO",
    ...over,
  };
}

describe("MisPrestamos", () => {
  it("muestra un mensaje cuando no hay préstamos", () => {
    render(<MisPrestamos prestamos={[]} />);
    expect(screen.getByText("No tenés préstamos.")).toBeInTheDocument();
  });

  it("permite devolver un préstamo activo", async () => {
    const onDevolver = vi.fn();
    render(
      <MisPrestamos prestamos={[prestamo({ id: "p1" })]} onDevolver={onDevolver} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Devolver" }));
    expect(onDevolver).toHaveBeenCalledWith("p1");
  });

  it("no muestra botón Devolver en préstamos ya devueltos", () => {
    render(
      <MisPrestamos
        prestamos={[
          prestamo({
            id: "p1",
            estado: "DEVUELTO",
            fechaDevolucion: "2026-06-10T10:00:00.000Z",
          }),
        ]}
        onDevolver={() => {}}
      />,
    );
    expect(screen.queryByRole("button", { name: "Devolver" })).not.toBeInTheDocument();
    expect(screen.getByText("DEVUELTO")).toBeInTheDocument();
  });
});
