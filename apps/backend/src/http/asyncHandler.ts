import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Envuelve un handler asíncrono para que cualquier rechazo de promesa se derive
 * al middleware de manejo de errores de Express (que no captura async por sí solo).
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
