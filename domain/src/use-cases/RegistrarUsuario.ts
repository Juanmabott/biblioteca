import { Usuario } from "../entities/Usuario.js";
import type { Rol } from "../entities/roles.js";
import { ValidationError, ConflictError } from "../errors/DomainError.js";
import type { UsuarioRepository } from "../services/repositories.js";
import type { PasswordHasher, IdGenerator } from "../services/ports.js";

export interface RegistrarUsuarioInput {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

export interface RegistrarUsuarioRepos {
  usuarios: UsuarioRepository;
}

export interface RegistrarUsuarioConfig {
  hasher: PasswordHasher;
  idGen: IdGenerator;
  /** Longitud mínima de la contraseña en claro. */
  minPasswordLength: number;
}

/**
 * Caso de uso: registrar un nuevo usuario.
 * Valida la contraseña, asegura que el email no esté tomado, la hashea con el
 * puerto PasswordHasher y persiste el usuario. La contraseña en claro nunca se
 * almacena.
 */
export class RegistrarUsuario {
  constructor(
    private readonly repos: RegistrarUsuarioRepos,
    private readonly config: RegistrarUsuarioConfig,
  ) {}

  async ejecutar(input: RegistrarUsuarioInput): Promise<Usuario> {
    const { usuarios } = this.repos;
    const { hasher, idGen, minPasswordLength } = this.config;

    if (!input.password || input.password.length < minPasswordLength) {
      throw new ValidationError(
        `La contraseña debe tener al menos ${minPasswordLength} caracteres.`,
      );
    }

    const email = input.email.trim().toLowerCase();
    if (await usuarios.findByEmail(email)) {
      throw new ConflictError(`Ya existe un usuario con el email ${email}.`);
    }

    const passwordHash = await hasher.hash(input.password);
    const usuario = Usuario.crear({
      id: idGen.next(),
      nombre: input.nombre,
      email,
      passwordHash,
      rol: input.rol,
    });

    await usuarios.save(usuario);
    return usuario;
  }
}
