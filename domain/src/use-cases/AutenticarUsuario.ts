import type { Usuario } from "../entities/Usuario.js";
import { AuthenticationError } from "../errors/DomainError.js";
import type { UsuarioRepository } from "../services/repositories.js";
import type { PasswordHasher } from "../services/ports.js";

export interface AutenticarUsuarioInput {
  email: string;
  password: string;
}

export interface AutenticarUsuarioRepos {
  usuarios: UsuarioRepository;
}

export interface AutenticarUsuarioConfig {
  hasher: PasswordHasher;
}

/**
 * Caso de uso: autenticar un usuario por email y contraseña.
 * Devuelve el usuario autenticado; la emisión de tokens (JWT/sesión) es
 * responsabilidad de la capa de infraestructura. Ante email inexistente o
 * contraseña incorrecta lanza el mismo error para no revelar qué falló.
 */
export class AutenticarUsuario {
  constructor(
    private readonly repos: AutenticarUsuarioRepos,
    private readonly config: AutenticarUsuarioConfig,
  ) {}

  async ejecutar(input: AutenticarUsuarioInput): Promise<Usuario> {
    const usuario = await this.repos.usuarios.findByEmail(
      input.email.trim().toLowerCase(),
    );
    const credencialesInvalidas = new AuthenticationError(
      "Email o contraseña incorrectos.",
    );

    if (!usuario) {
      throw credencialesInvalidas;
    }

    const ok = await this.config.hasher.compare(
      input.password,
      usuario.passwordHash,
    );
    if (!ok) {
      throw credencialesInvalidas;
    }

    return usuario;
  }
}
