import type { Meta, StoryObj } from "@storybook/react";
import { LoginForm } from "./LoginForm.js";

const meta: Meta<typeof LoginForm> = {
  title: "Auth/LoginForm",
  component: LoginForm,
  args: { onSubmit: () => {} },
};
export default meta;

type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {};

export const ConError: Story = {
  args: { error: "Email o contraseña incorrectos." },
};

export const Cargando: Story = {
  args: { cargando: true },
};
