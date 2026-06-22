import type { Meta, StoryObj } from "@storybook/react";
import { MisPrestamos } from "./MisPrestamos.js";

const meta: Meta<typeof MisPrestamos> = {
  title: "Préstamos/MisPrestamos",
  component: MisPrestamos,
  args: { onDevolver: () => {} },
};
export default meta;

type Story = StoryObj<typeof MisPrestamos>;

const base = {
  libroId: "libro-1",
  socioId: "socio-1",
  fechaPrestamo: "2026-06-01T10:00:00.000Z",
  fechaVencimiento: "2026-06-15T10:00:00.000Z",
  fechaDevolucion: null as string | null,
};

export const ConPrestamos: Story = {
  args: {
    prestamos: [
      { ...base, id: "p1", estado: "ACTIVO" },
      { ...base, id: "p2", estado: "VENCIDO" },
      {
        ...base,
        id: "p3",
        estado: "DEVUELTO",
        fechaDevolucion: "2026-06-10T10:00:00.000Z",
      },
    ],
  },
};

export const Vacio: Story = {
  args: { prestamos: [] },
};
