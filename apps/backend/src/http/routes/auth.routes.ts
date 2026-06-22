import { Router } from "express";
import { Rol } from "@biblioteca/domain";
import type { Container } from "../../container.js";
import { asyncHandler } from "../asyncHandler.js";
import { usuarioDTO } from "../presenters.js";

export function authRoutes(c: Container): Router {
  const router = Router();

  // Registro público: siempre crea un SOCIO. Los bibliotecarios se aprovisionan
  // por seed/administración, no por registro abierto.
  router.post(
    "/register",
    asyncHandler(async (req, res) => {
      const { nombre, email, password } = req.body ?? {};
      const usuario = await c.registrarUsuario.ejecutar({
        nombre,
        email,
        password,
        rol: Rol.SOCIO,
      });
      res.status(201).json(usuarioDTO(usuario));
    }),
  );

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const { email, password } = req.body ?? {};
      const usuario = await c.autenticarUsuario.ejecutar({ email, password });
      const token = c.tokens.firmar({ sub: usuario.id, rol: usuario.rol });
      res.json({ token, usuario: usuarioDTO(usuario) });
    }),
  );

  return router;
}
