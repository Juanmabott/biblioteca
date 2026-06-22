export { Libro } from "./entities/Libro.js";
export type {
  CrearLibroProps,
  ReconstituirLibroProps,
  EditarLibroProps,
} from "./entities/Libro.js";
export { Usuario } from "./entities/Usuario.js";
export type { CrearUsuarioProps } from "./entities/Usuario.js";
export { Rol, Permiso, permisosPorRol, rolTienePermiso } from "./entities/roles.js";
export { Prestamo, EstadoPrestamo } from "./entities/Prestamo.js";
export type {
  CrearPrestamoProps,
  CrearPrestamoPorDiasProps,
  ReconstituirPrestamoProps,
} from "./entities/Prestamo.js";
export {
  DomainError,
  ValidationError,
  BusinessRuleError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  AuthenticationError,
} from "./errors/DomainError.js";

// Puertos
export type {
  LibroRepository,
  UsuarioRepository,
  PrestamoRepository,
} from "./services/repositories.js";
export type { PasswordHasher, Clock, IdGenerator } from "./services/ports.js";

// Casos de uso
export { PrestarLibro } from "./use-cases/PrestarLibro.js";
export type {
  PrestarLibroInput,
  PrestarLibroRepos,
  PrestarLibroConfig,
} from "./use-cases/PrestarLibro.js";
export { DevolverLibro } from "./use-cases/DevolverLibro.js";
export type {
  DevolverLibroInput,
  DevolverLibroRepos,
  DevolverLibroConfig,
} from "./use-cases/DevolverLibro.js";
export { RegistrarUsuario } from "./use-cases/RegistrarUsuario.js";
export type {
  RegistrarUsuarioInput,
  RegistrarUsuarioRepos,
  RegistrarUsuarioConfig,
} from "./use-cases/RegistrarUsuario.js";
export { AutenticarUsuario } from "./use-cases/AutenticarUsuario.js";
export type {
  AutenticarUsuarioInput,
  AutenticarUsuarioRepos,
  AutenticarUsuarioConfig,
} from "./use-cases/AutenticarUsuario.js";
export { ListarPrestamosSocio } from "./use-cases/ListarPrestamosSocio.js";
export type { ListarPrestamosSocioInput } from "./use-cases/ListarPrestamosSocio.js";
export { autorizar } from "./use-cases/autorizacion.js";
export {
  CrearLibro,
  EditarLibro,
  EliminarLibro,
  ListarLibros,
} from "./use-cases/GestionarCatalogo.js";
export type {
  CatalogoRepos,
  CrearLibroInput,
  EditarLibroInput,
  EliminarLibroInput,
} from "./use-cases/GestionarCatalogo.js";
