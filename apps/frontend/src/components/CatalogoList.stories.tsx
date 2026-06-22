import type { Meta, StoryObj } from "@storybook/react";
import { CatalogoList } from "./CatalogoList.js";

const meta: Meta<typeof CatalogoList> = {
  title: "Catálogo/CatalogoList",
  component: CatalogoList,
};
export default meta;

type Story = StoryObj<typeof CatalogoList>;

const libros = [
  {
    id: "libro-1",
    titulo: "Dune",
    autor: "Frank Herbert",
    isbn: "isbn-1",
    copiasTotales: 3,
    copiasDisponibles: 2,
  },
  {
    id: "libro-2",
    titulo: "1984",
    autor: "George Orwell",
    isbn: "isbn-2",
    copiasTotales: 1,
    copiasDisponibles: 0,
  },
];

export const ConLibros: Story = {
  args: { libros, onPrestar: () => {} },
};

export const Vacio: Story = {
  args: { libros: [] },
};
