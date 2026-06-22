import type { Meta, StoryObj } from "@storybook/react";
import { CrearLibroForm } from "./CrearLibroForm.js";

const meta: Meta<typeof CrearLibroForm> = {
  title: "Catálogo/CrearLibroForm",
  component: CrearLibroForm,
  args: { onSubmit: () => {} },
};
export default meta;

type Story = StoryObj<typeof CrearLibroForm>;

export const Default: Story = {};

export const ConError: Story = {
  args: { error: "Ya existe un libro con ese ISBN." },
};

export const Cargando: Story = {
  args: { cargando: true },
};
