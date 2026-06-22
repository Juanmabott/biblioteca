import { describe, it, expect } from "vitest";
import { Rol, Permiso, rolTienePermiso } from "./roles.js";

describe("rolTienePermiso", () => {
  it("el BIBLIOTECARIO puede gestionar libros y usuarios", () => {
    expect(rolTienePermiso(Rol.BIBLIOTECARIO, Permiso.GESTIONAR_LIBROS)).toBe(
      true,
    );
    expect(rolTienePermiso(Rol.BIBLIOTECARIO, Permiso.GESTIONAR_USUARIOS)).toBe(
      true,
    );
  });

  it("el SOCIO no puede gestionar libros ni usuarios", () => {
    expect(rolTienePermiso(Rol.SOCIO, Permiso.GESTIONAR_LIBROS)).toBe(false);
    expect(rolTienePermiso(Rol.SOCIO, Permiso.GESTIONAR_USUARIOS)).toBe(false);
  });

  it("el SOCIO puede ver el catálogo y operar préstamos", () => {
    expect(rolTienePermiso(Rol.SOCIO, Permiso.VER_CATALOGO)).toBe(true);
    expect(rolTienePermiso(Rol.SOCIO, Permiso.PRESTAR_LIBRO)).toBe(true);
    expect(rolTienePermiso(Rol.SOCIO, Permiso.DEVOLVER_LIBRO)).toBe(true);
  });
});
