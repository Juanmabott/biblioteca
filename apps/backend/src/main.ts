import { Rol } from "@biblioteca/domain";
import { loadConfig } from "./config.js";
import { createContainer } from "./container.js";
import { createApp } from "./app.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const container = createContainer(config);

  // Prepara la persistencia (crea el schema en PostgreSQL si corresponde).
  await container.init();

  // Seed de un bibliotecario inicial para poder gestionar el catálogo.
  // En producción esto debería hacerse con una migración/seed controlada.
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@biblioteca.test";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin12345";
  try {
    await container.registrarUsuario.ejecutar({
      nombre: "Administrador",
      email: adminEmail,
      password: adminPassword,
      rol: Rol.BIBLIOTECARIO,
    });
    // eslint-disable-next-line no-console
    console.log(`Seed: bibliotecario inicial -> ${adminEmail} / ${adminPassword}`);
  } catch {
    // Ya existía: ignorar.
  }

  const app = createApp(container);
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Biblioteca API escuchando en http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
