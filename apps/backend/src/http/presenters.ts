import type { Libro, Usuario, Prestamo } from "@biblioteca/domain";

/** Convierte entidades del dominio en objetos planos seguros para la respuesta HTTP. */

export function libroDTO(libro: Libro) {
  return {
    id: libro.id,
    titulo: libro.titulo,
    autor: libro.autor,
    isbn: libro.isbn,
    copiasTotales: libro.copiasTotales,
    copiasDisponibles: libro.copiasDisponibles,
  };
}

export function usuarioDTO(usuario: Usuario) {
  // Nunca exponemos el passwordHash.
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };
}

export function prestamoDTO(prestamo: Prestamo, ahora: Date = new Date()) {
  return {
    id: prestamo.id,
    libroId: prestamo.libroId,
    socioId: prestamo.socioId,
    fechaPrestamo: prestamo.fechaPrestamo.toISOString(),
    fechaVencimiento: prestamo.fechaVencimiento.toISOString(),
    fechaDevolucion: prestamo.fechaDevolucion?.toISOString() ?? null,
    estado: prestamo.estado(ahora),
  };
}
