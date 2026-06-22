import "express";
import type { Rol } from "@biblioteca/domain";

export interface AuthUser {
  id: string;
  rol: Rol;
}

// Extiende el Request de Express para exponer el usuario autenticado.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
