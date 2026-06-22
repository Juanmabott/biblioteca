import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import type { PasswordHasher, Clock, IdGenerator } from "@biblioteca/domain";

/** Implementación de PasswordHasher con bcrypt. */
export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly rounds: number) {}
  hash(plano: string): Promise<string> {
    return bcrypt.hash(plano, this.rounds);
  }
  compare(plano: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plano, hash);
  }
}

/** Reloj basado en la hora del sistema. */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

/** Generador de ids basado en UUID v4. */
export class UuidIdGenerator implements IdGenerator {
  next(): string {
    return randomUUID();
  }
}
