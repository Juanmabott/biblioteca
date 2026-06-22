/** Roles de acceso del sistema. */
export const Rol = {
  BIBLIOTECARIO: "BIBLIOTECARIO",
  SOCIO: "SOCIO",
} as const;

export type Rol = (typeof Rol)[keyof typeof Rol];

/** Permisos granulares que las políticas de acceso evalúan. */
export const Permiso = {
  GESTIONAR_LIBROS: "GESTIONAR_LIBROS",
  PRESTAR_LIBRO: "PRESTAR_LIBRO",
  DEVOLVER_LIBRO: "DEVOLVER_LIBRO",
  VER_CATALOGO: "VER_CATALOGO",
  GESTIONAR_USUARIOS: "GESTIONAR_USUARIOS",
} as const;

export type Permiso = (typeof Permiso)[keyof typeof Permiso];

/**
 * Mapeo de permisos por rol. El BIBLIOTECARIO administra el catálogo y los
 * usuarios; el SOCIO consulta el catálogo y opera sus propios préstamos.
 */
export const permisosPorRol: Record<Rol, readonly Permiso[]> = {
  [Rol.BIBLIOTECARIO]: [
    Permiso.GESTIONAR_LIBROS,
    Permiso.GESTIONAR_USUARIOS,
    Permiso.VER_CATALOGO,
    Permiso.PRESTAR_LIBRO,
    Permiso.DEVOLVER_LIBRO,
  ],
  [Rol.SOCIO]: [
    Permiso.VER_CATALOGO,
    Permiso.PRESTAR_LIBRO,
    Permiso.DEVOLVER_LIBRO,
  ],
};

export function rolTienePermiso(rol: Rol, permiso: Permiso): boolean {
  return permisosPorRol[rol].includes(permiso);
}
