import { describe, it, expect, beforeEach } from "vitest";
import {
  CrearLibro,
  EditarLibro,
  EliminarLibro,
  ListarLibros,
} from "./GestionarCatalogo.js";
import { Libro } from "../entities/Libro.js";
import { Usuario } from "../entities/Usuario.js";
import { Rol } from "../entities/roles.js";
import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../errors/DomainError.js";
import {
  InMemoryLibroRepository,
  InMemoryUsuarioRepository,
  SequentialIdGenerator,
} from "../__test-support__/fakes.js";

function bibliotecario() {
  return Usuario.crear({
    id: "bib-1",
    nombre: "Biblio",
    email: "bib@biblioteca.test",
    passwordHash: "hash::x",
    rol: Rol.BIBLIOTECARIO,
  });
}

function socio() {
  return Usuario.crear({
    id: "socio-1",
    nombre: "Ana",
    email: "ana@biblioteca.test",
    passwordHash: "hash::x",
    rol: Rol.SOCIO,
  });
}

describe("CrearLibro", () => {
  let libros: InMemoryLibroRepository;
  let usuarios: InMemoryUsuarioRepository;
  let crear: CrearLibro;

  beforeEach(() => {
    libros = new InMemoryLibroRepository();
    usuarios = new InMemoryUsuarioRepository([bibliotecario(), socio()]);
    crear = new CrearLibro(
      { libros, usuarios },
      { idGen: new SequentialIdGenerator("libro") },
    );
  });

  it("un bibliotecario crea un libro", async () => {
    const libro = await crear.ejecutar({
      actorId: "bib-1",
      titulo: "Dune",
      autor: "Frank Herbert",
      isbn: "isbn-dune",
      copiasTotales: 4,
    });
    expect(libro.id).toBe("libro-1");
    expect(await libros.findByIsbn("isbn-dune")).not.toBeNull();
  });

  it("un socio no puede crear libros", async () => {
    await expect(
      crear.ejecutar({
        actorId: "socio-1",
        titulo: "Dune",
        autor: "Frank Herbert",
        isbn: "isbn-dune",
        copiasTotales: 4,
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("rechaza un ISBN duplicado", async () => {
    await crear.ejecutar({
      actorId: "bib-1",
      titulo: "Dune",
      autor: "Frank Herbert",
      isbn: "isbn-dune",
      copiasTotales: 4,
    });
    await expect(
      crear.ejecutar({
        actorId: "bib-1",
        titulo: "Dune (reimpresión)",
        autor: "Frank Herbert",
        isbn: "isbn-dune",
        copiasTotales: 2,
      }),
    ).rejects.toThrow(ConflictError);
  });
});

describe("EditarLibro", () => {
  let libros: InMemoryLibroRepository;
  let usuarios: InMemoryUsuarioRepository;
  let editar: EditarLibro;

  beforeEach(() => {
    libros = new InMemoryLibroRepository([
      Libro.crear({
        id: "libro-1",
        titulo: "Dune",
        autor: "Frank Herbert",
        isbn: "isbn-dune",
        copiasTotales: 3,
      }),
    ]);
    usuarios = new InMemoryUsuarioRepository([bibliotecario(), socio()]);
    editar = new EditarLibro({ libros, usuarios });
  });

  it("edita el título", async () => {
    const libro = await editar.ejecutar({
      actorId: "bib-1",
      libroId: "libro-1",
      titulo: "Dune Messiah",
    });
    expect(libro.titulo).toBe("Dune Messiah");
    expect((await libros.findById("libro-1"))?.titulo).toBe("Dune Messiah");
  });

  it("falla si el libro no existe", async () => {
    await expect(
      editar.ejecutar({ actorId: "bib-1", libroId: "fantasma", titulo: "X" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("un socio no puede editar", async () => {
    await expect(
      editar.ejecutar({ actorId: "socio-1", libroId: "libro-1", titulo: "X" }),
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("EliminarLibro", () => {
  let libros: InMemoryLibroRepository;
  let usuarios: InMemoryUsuarioRepository;
  let eliminar: EliminarLibro;

  beforeEach(() => {
    libros = new InMemoryLibroRepository([
      Libro.crear({
        id: "libro-1",
        titulo: "Dune",
        autor: "Frank Herbert",
        isbn: "isbn-dune",
        copiasTotales: 3,
      }),
    ]);
    usuarios = new InMemoryUsuarioRepository([bibliotecario(), socio()]);
    eliminar = new EliminarLibro({ libros, usuarios });
  });

  it("un bibliotecario elimina un libro", async () => {
    await eliminar.ejecutar({ actorId: "bib-1", libroId: "libro-1" });
    expect(await libros.findById("libro-1")).toBeNull();
  });

  it("un socio no puede eliminar", async () => {
    await expect(
      eliminar.ejecutar({ actorId: "socio-1", libroId: "libro-1" }),
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("ListarLibros", () => {
  it("devuelve todo el catálogo", async () => {
    const libros = new InMemoryLibroRepository([
      Libro.crear({
        id: "libro-1",
        titulo: "Dune",
        autor: "Frank Herbert",
        isbn: "isbn-1",
        copiasTotales: 1,
      }),
      Libro.crear({
        id: "libro-2",
        titulo: "1984",
        autor: "George Orwell",
        isbn: "isbn-2",
        copiasTotales: 2,
      }),
    ]);
    const listar = new ListarLibros({ libros });
    const resultado = await listar.ejecutar();
    expect(resultado).toHaveLength(2);
  });
});
