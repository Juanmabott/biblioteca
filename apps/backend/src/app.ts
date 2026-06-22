import "./http/types.js";
import express, { type Express } from "express";
import cors from "cors";
import type { Container } from "./container.js";
import { autenticar } from "./http/middlewares/auth.js";
import { errorHandler } from "./http/middlewares/errorHandler.js";
import { authRoutes } from "./http/routes/auth.routes.js";
import { librosRoutes } from "./http/routes/libros.routes.js";
import { prestamosRoutes } from "./http/routes/prestamos.routes.js";

/** Construye la aplicación Express a partir del contenedor de dependencias. */
export function createApp(container: Container): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const auth = autenticar(container.tokens);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/auth", authRoutes(container));
  app.use("/libros", librosRoutes(container, auth));
  app.use("/prestamos", prestamosRoutes(container, auth));

  app.use(errorHandler);
  return app;
}
