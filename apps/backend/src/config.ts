/** Configuración del backend leída del entorno, con valores por defecto para desarrollo. */
export interface AppConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  diasPrestamo: number;
  maxPrestamosActivos: number;
  minPasswordLength: number;
  /** URL de conexión a PostgreSQL. Si no está, se usan repos en memoria. */
  databaseUrl?: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: Number(env.PORT ?? 3000),
    // En producción JWT_SECRET DEBE venir del entorno (ver etapa docker / secretos).
    jwtSecret: env.JWT_SECRET ?? "dev-secret-cambiar-en-produccion",
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? "1h",
    bcryptRounds: Number(env.BCRYPT_ROUNDS ?? 10),
    diasPrestamo: Number(env.DIAS_PRESTAMO ?? 14),
    maxPrestamosActivos: Number(env.MAX_PRESTAMOS_ACTIVOS ?? 3),
    minPasswordLength: Number(env.MIN_PASSWORD_LENGTH ?? 8),
    ...(env.DATABASE_URL ? { databaseUrl: env.DATABASE_URL } : {}),
  };
}
