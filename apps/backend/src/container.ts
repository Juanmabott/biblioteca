import {
  RegistrarUsuario,
  AutenticarUsuario,
  PrestarLibro,
  DevolverLibro,
  CrearLibro,
  EditarLibro,
  EliminarLibro,
  ListarLibros,
  ListarPrestamosSocio,
} from "@biblioteca/domain";
import type { AppConfig } from "./config.js";
import {
  buildRepositories,
  type Repositories,
} from "./adapters/repositoryFactory.js";
import {
  BcryptPasswordHasher,
  SystemClock,
  UuidIdGenerator,
} from "./adapters/services.js";
import { TokenService } from "./adapters/TokenService.js";

/**
 * Composition root: instancia los adaptadores (implementaciones de los puertos)
 * y arma los casos de uso del dominio inyectándoles esas dependencias. Es el
 * único lugar donde infraestructura y dominio se "conocen".
 */
export interface Container {
  tokens: TokenService;
  /** Prepara la persistencia (crea schema si corresponde). */
  init(): Promise<void>;
  /** Libera recursos (cierra el pool de la base). */
  close(): Promise<void>;
  registrarUsuario: RegistrarUsuario;
  autenticarUsuario: AutenticarUsuario;
  prestarLibro: PrestarLibro;
  devolverLibro: DevolverLibro;
  crearLibro: CrearLibro;
  editarLibro: EditarLibro;
  eliminarLibro: EliminarLibro;
  listarLibros: ListarLibros;
  listarPrestamosSocio: ListarPrestamosSocio;
}

export function createContainer(
  config: AppConfig,
  repos: Repositories = buildRepositories(config),
): Container {
  const { libros, usuarios, prestamos } = repos;

  const hasher = new BcryptPasswordHasher(config.bcryptRounds);
  const clock = new SystemClock();
  const idGen = new UuidIdGenerator();
  const tokens = new TokenService(config.jwtSecret, config.jwtExpiresIn);

  return {
    tokens,
    init: () => repos.init(),
    close: () => repos.close(),
    registrarUsuario: new RegistrarUsuario(
      { usuarios },
      { hasher, idGen, minPasswordLength: config.minPasswordLength },
    ),
    autenticarUsuario: new AutenticarUsuario({ usuarios }, { hasher }),
    prestarLibro: new PrestarLibro(
      { libros, usuarios, prestamos },
      {
        clock,
        idGen,
        diasPrestamo: config.diasPrestamo,
        maxPrestamosActivos: config.maxPrestamosActivos,
      },
    ),
    devolverLibro: new DevolverLibro({ libros, prestamos }, { clock }),
    crearLibro: new CrearLibro({ libros, usuarios }, { idGen }),
    editarLibro: new EditarLibro({ libros, usuarios }),
    eliminarLibro: new EliminarLibro({ libros, usuarios }),
    listarLibros: new ListarLibros({ libros }),
    listarPrestamosSocio: new ListarPrestamosSocio({ prestamos }),
  };
}
