import type { Request, Response, NextFunction } from "express";
import {
  DomainError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  AuthenticationError,
  BusinessRuleError,
} from "@biblioteca/domain";

/** Mapea cada tipo de error de dominio a su código HTTP correspondiente. */
function statusFor(err: DomainError): number {
  if (err instanceof ValidationError) return 422;
  if (err instanceof AuthenticationError) return 401;
  if (err instanceof ForbiddenError) return 403;
  if (err instanceof NotFoundError) return 404;
  if (err instanceof ConflictError) return 409;
  if (err instanceof BusinessRuleError) return 409;
  return 400;
}

/** Middleware de manejo de errores. Debe registrarse al final, con 4 argumentos. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof DomainError) {
    res.status(statusFor(err)).json({ error: err.name, message: err.message });
    return;
  }
  // eslint-disable-next-line no-console
  console.error("Error no controlado:", err);
  res.status(500).json({ error: "InternalServerError", message: "Error interno." });
}
