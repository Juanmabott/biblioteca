/**
 * Error base para todas las violaciones de reglas de negocio del dominio.
 * Permite que la capa de infraestructura (p. ej. el backend) distinga errores
 * de dominio de errores técnicos y los mapee a respuestas HTTP adecuadas.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {}
export class BusinessRuleError extends DomainError {}
export class NotFoundError extends DomainError {}
export class ForbiddenError extends DomainError {}
export class ConflictError extends DomainError {}
export class AuthenticationError extends DomainError {}
