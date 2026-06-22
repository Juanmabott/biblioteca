import type { Meta, StoryObj } from "@storybook/react";
import { LibroCard } from "./LibroCard.js";

const meta: Meta<typeof LibroCard> = {
  title: "Catálogo/LibroCard",
  component: LibroCard,
};
export default meta;

type Story = StoryObj<typeof LibroCard>;

const base = {
  id: "libro-1",
  titulo: "Dune",
  autor: "Frank Herbert",
  isbn: "9780441013593",
  copiasTotales: 3,
  copiasDisponibles: 2,
};

export const Disponible: Story = {
  args: { libro: base, onPrestar: () => {} },
};

export const SinCopias: Story = {
  args: {
    libro: { ...base, copiasDisponibles: 0 },
    onPrestar: () => {},
  },
};

export const SoloLectura: Story = {
  args: { libro: base },
};
