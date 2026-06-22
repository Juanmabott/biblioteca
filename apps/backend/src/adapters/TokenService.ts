import jwt from "jsonwebtoken";
import type { Rol } from "@biblioteca/domain";

export interface TokenPayload {
  sub: string; // id del usuario
  rol: Rol;
}

/**
 * Emisión y verificación de JSON Web Tokens. La autenticación stateless con JWT
 * es una decisión de infraestructura: el dominio solo valida credenciales.
 */
export class TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  firmar(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    } as jwt.SignOptions);
  }

  verificar(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.secret);
    if (typeof decoded === "string") {
      throw new Error("Token inválido.");
    }
    return { sub: String(decoded.sub), rol: decoded["rol"] as Rol };
  }
}
