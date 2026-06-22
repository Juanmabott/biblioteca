import { Libro, type EditarLibroProps } from "../entities/Libro.js";
import { Permiso } from "../entities/roles.js";
import { NotFoundError, ConflictError } from "../errors/DomainError.js";
import type {
  LibroRepository,
  UsuarioRepository,
} from "../services/repositories.js";
import type { IdGenerator } from "../services/ports.js";
import { autorizar } from "./autorizacion.js";

export interface CatalogoRepos {
  libros: LibroRepository;
  usuarios: UsuarioRepository;
}

// ---------------------------------------------------------------------------
// CrearLibro
// ---------------------------------------------------------------------------

export interface CrearLibroInput {
  actorId: string;
  titulo: string;
  autor: string;
  isbn: string;
  copiasTotales: number;
}

/** Alta de un libro en el catálogo. Requiere permiso GESTIONAR_LIBROS e ISBN único. */
export class CrearLibro {
  constructor(
    private readonly repos: CatalogoRepos,
    private readonly config: { idGen: IdGenerator },
  ) {}

  async ejecutar(input: CrearLibroInput): Promise<Libro> {
    await autorizar(this.repos.usuarios, input.actorId, Permiso.GESTIONAR_LIBROS);

    if (await this.repos.libros.findByIsbn(input.isbn.trim())) {
      throw new ConflictError(`Ya existe un libro con el ISBN ${input.isbn}.`);
    }

    const libro = Libro.crear({
      id: this.config.idGen.next(),
      titulo: input.titulo,
      autor: input.autor,
      isbn: input.isbn,
      copiasTotales: input.copiasTotales,
    });
    await this.repos.libros.save(libro);
    return libro;
  }
}

// ---------------------------------------------------------------------------
// EditarLibro
// ---------------------------------------------------------------------------

export interface EditarLibroInput extends EditarLibroProps {
  actorId: string;
  libroId: string;
}

/** Edición de metadata y/o stock de un libro. Requiere permiso GESTIONAR_LIBROS. */
export class EditarLibro {
  constructor(private readonly repos: CatalogoRepos) {}

  async ejecutar(input: EditarLibroInput): Promise<Libro> {
    await autorizar(this.repos.usuarios, input.actorId, Permiso.GESTIONAR_LIBROS);

    const libro = await this.repos.libros.findById(input.libroId);
    if (!libro) {
      throw new NotFoundError(`No existe el libro ${input.libroId}.`);
    }

    const editado = libro.editar({
      titulo: input.titulo,
      autor: input.autor,
      isbn: input.isbn,
      copiasTotales: input.copiasTotales,
    });
    await this.repos.libros.save(editado);
    return editado;
  }
}

// ---------------------------------------------------------------------------
// EliminarLibro
// ---------------------------------------------------------------------------

export interface EliminarLibroInput {
  actorId: string;
  libroId: string;
}

/** Baja de un libro del catálogo. Requiere permiso GESTIONAR_LIBROS. */
export class EliminarLibro {
  constructor(private readonly repos: CatalogoRepos) {}

  async ejecutar(input: EliminarLibroInput): Promise<void> {
    await autorizar(this.repos.usuarios, input.actorId, Permiso.GESTIONAR_LIBROS);

    const libro = await this.repos.libros.findById(input.libroId);
    if (!libro) {
      throw new NotFoundError(`No existe el libro ${input.libroId}.`);
    }
    await this.repos.libros.delete(libro.id);
  }
}

// ---------------------------------------------------------------------------
// ListarLibros
// ---------------------------------------------------------------------------

/** Lista el catálogo completo. Consulta pública (cualquiera puede ver el catálogo). */
export class ListarLibros {
  constructor(private readonly repos: { libros: LibroRepository }) {}

  async ejecutar(): Promise<Libro[]> {
    return this.repos.libros.listAll();
  }
}
