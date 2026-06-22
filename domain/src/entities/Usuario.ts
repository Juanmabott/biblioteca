import { ValidationError } from "../errors/DomainError.js";
import { Rol, Permiso, rolTienePermiso } from "./roles.js";

export interface CrearUsuarioProps {
  id: string;
  nombre: string;
  email: string;
  /** Contraseña ya hasheada por un servicio de la capa de aplicación/infra. */
  passwordHash: string;
  rol: Rol;
}

// Validación de email deliberadamente simple: el dominio no debe conocer todos
// los detalles del RFC, solo rechazar lo obviamente inválido.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Entidad Usuario. Conoce su rol y, a través de él, sus permisos. Nunca
 * almacena la contraseña en claro: solo el hash producido por la infraestructura.
 */
export class Usuario {
  private constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly rol: Rol,
  ) {}

  static crear(props: CrearUsuarioProps): Usuario {
    if (!props.id?.trim()) {
      throw new ValidationError("El id del usuario es obligatorio.");
    }
    if (!props.nombre?.trim()) {
      throw new ValidationError("El nombre es obligatorio.");
    }
    const email = props.email?.trim().toLowerCase() ?? "";
    if (!EMAIL_RE.test(email)) {
      throw new ValidationError("El email no es válido.");
    }
    if (!props.passwordHash?.trim()) {
      throw new ValidationError("El passwordHash es obligatorio.");
    }
    return new Usuario(
      props.id,
      props.nombre.trim(),
      email,
      props.passwordHash,
      props.rol,
    );
  }

  tienePermiso(permiso: Permiso): boolean {
    return rolTienePermiso(this.rol, permiso);
  }
}
