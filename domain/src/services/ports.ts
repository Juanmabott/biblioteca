/**
 * Puertos de servicios técnicos que el dominio necesita pero no implementa.
 * La infraestructura provee las implementaciones concretas (bcrypt, reloj del
 * sistema, generador de UUID, etc.).
 */

/** Hashea y verifica contraseñas. El dominio nunca ve la contraseña en claro persistida. */
export interface PasswordHasher {
  hash(plano: string): Promise<string>;
  compare(plano: string, hash: string): Promise<boolean>;
}

/** Fuente de la fecha/hora actual. Inyectarla mantiene los casos de uso deterministas y testeables. */
export interface Clock {
  now(): Date;
}

/** Generador de identificadores únicos para nuevas entidades. */
export interface IdGenerator {
  next(): string;
}
