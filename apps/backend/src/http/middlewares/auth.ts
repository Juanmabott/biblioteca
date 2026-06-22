import type { Request, Response, NextFunction } from "express";
import { AuthenticationError, ForbiddenError } from "@biblioteca/domain";
import type { Permiso } from "@biblioteca/domain";
import { rolTienePermiso } from "@biblioteca/domain";
import type { TokenService } from "../../adapters/TokenService.js";

/** Middleware que exige un JWT válido y carga el usuario en req.user. */
export function autenticar(tokens: TokenService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization ?? "";
    const [esquema, token] = header.split(" ");
    if (esquema !== "Bearer" || !token) {
      throw new AuthenticationError("Falta el token de autenticación.");
    }
    try {
      const payload = tokens.verificar(token);
      req.user = { id: payload.sub, rol: payload.rol };
      next();
    } catch {
      throw new AuthenticationError("Token inválido o expirado.");
    }
  };
}

/** Middleware que exige que el usuario autenticado tenga un permiso concreto. */
export function requierePermiso(permiso: Permiso) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError("No autenticado.");
    }
    if (!rolTienePermiso(req.user.rol, permiso)) {
      throw new ForbiddenError("No tenés permiso para esta acción.");
    }
    next();
  };
}
