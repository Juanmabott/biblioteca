import { Router } from "express";
import type { Container } from "../../container.js";
import { asyncHandler } from "../asyncHandler.js";
import { autenticar } from "../middlewares/auth.js";
import { prestamoDTO } from "../presenters.js";

export function prestamosRoutes(
  c: Container,
  auth: ReturnType<typeof autenticar>,
): Router {
  const router = Router();

  router.use(auth);

  // Préstamos del socio autenticado (historial + activos).
  router.get(
    "/mios",
    asyncHandler(async (req, res) => {
      const prestamos = await c.listarPrestamosSocio.ejecutar({
        socioId: req.user!.id,
      });
      res.json(prestamos.map((p) => prestamoDTO(p)));
    }),
  );

  // Un socio toma prestado un libro; el socio es el usuario autenticado.
  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const { libroId } = req.body ?? {};
      const prestamo = await c.prestarLibro.ejecutar({
        socioId: req.user!.id,
        libroId,
      });
      res.status(201).json(prestamoDTO(prestamo));
    }),
  );

  // Registrar la devolución de un préstamo.
  router.post(
    "/:id/devolucion",
    asyncHandler(async (req, res) => {
      const prestamo = await c.devolverLibro.ejecutar({
        prestamoId: req.params.id,
      });
      res.json(prestamoDTO(prestamo));
    }),
  );

  return router;
}
