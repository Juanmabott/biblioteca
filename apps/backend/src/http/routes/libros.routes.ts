import { Router } from "express";
import { Permiso } from "@biblioteca/domain";
import type { Container } from "../../container.js";
import { asyncHandler } from "../asyncHandler.js";
import { autenticar, requierePermiso } from "../middlewares/auth.js";
import { libroDTO } from "../presenters.js";

export function librosRoutes(c: Container, auth: ReturnType<typeof autenticar>): Router {
  const router = Router();

  // Todas las rutas del catálogo requieren estar autenticado.
  router.use(auth);

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const libros = await c.listarLibros.ejecutar();
      res.json(libros.map(libroDTO));
    }),
  );

  router.post(
    "/",
    requierePermiso(Permiso.GESTIONAR_LIBROS),
    asyncHandler(async (req, res) => {
      const { titulo, autor, isbn, copiasTotales } = req.body ?? {};
      const libro = await c.crearLibro.ejecutar({
        actorId: req.user!.id,
        titulo,
        autor,
        isbn,
        copiasTotales,
      });
      res.status(201).json(libroDTO(libro));
    }),
  );

  router.put(
    "/:id",
    requierePermiso(Permiso.GESTIONAR_LIBROS),
    asyncHandler(async (req, res) => {
      const { titulo, autor, isbn, copiasTotales } = req.body ?? {};
      const libro = await c.editarLibro.ejecutar({
        actorId: req.user!.id,
        libroId: req.params.id,
        titulo,
        autor,
        isbn,
        copiasTotales,
      });
      res.json(libroDTO(libro));
    }),
  );

  router.delete(
    "/:id",
    requierePermiso(Permiso.GESTIONAR_LIBROS),
    asyncHandler(async (req, res) => {
      await c.eliminarLibro.ejecutar({
        actorId: req.user!.id,
        libroId: req.params.id,
      });
      res.status(204).send();
    }),
  );

  return router;
}
