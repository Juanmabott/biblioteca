import type { Usuario } from "../entities/Usuario.js";
import type { Permiso } from "../entities/roles.js";
import { NotFoundError, ForbiddenError } from "../errors/DomainError.js";
import type { UsuarioRepository } from "../services/repositories.js";

/**
 * Verifica que el actor exista y tenga el permiso requerido. Devuelve el usuario
 * autorizado o lanza NotFoundError/ForbiddenError. Centraliza la política de
 * acceso que comparten varios casos de uso.
 */
export async function autorizar(
  usuarios: UsuarioRepository,
  actorId: string,
  permiso: Permiso,
): Promise<Usuario> {
  const actor = await usuarios.findById(actorId);
  if (!actor) {
    throw new NotFoundError(`No existe el usuario ${actorId}.`);
  }
  if (!actor.tienePermiso(permiso)) {
    throw new ForbiddenError(
      `El usuario no tiene el permiso requerido (${permiso}).`,
    );
  }
  return actor;
}
