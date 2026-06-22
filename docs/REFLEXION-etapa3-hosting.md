# Reflexión — Actividad Final 3 (Docker Compose y hosting)

## Qué resuelve el `docker-compose`

El objetivo de esta etapa era poder levantar todo el sistema con un solo comando.
El `docker-compose.yml` define tres servicios que se comunican por una red interna de
Docker: la base de datos PostgreSQL (`db`), la API (`backend`) y la SPA servida por Nginx
(`frontend`). Con `docker compose up --build` se construyen las imágenes y arranca todo en
orden: el backend espera a que la base esté *healthy* (gracias al `healthcheck` y a
`depends_on: condition: service_healthy`) y crea el esquema de forma idempotente al iniciar.

Un detalle de arquitectura que pagó dividendos acá: como el dominio depende de puertos y no
de una base concreta, sumar PostgreSQL fue escribir una implementación nueva de los
repositorios (`PostgresLibroRepository`, etc.) y elegirla por configuración
(`DATABASE_URL`). No hubo que tocar ni una línea del dominio ni de los casos de uso. En
desarrollo se siguen usando los repos en memoria; en Docker, Postgres.

## ¿Qué pasa con el dominio y los certificados HTTPS?

En un servidor real, el sistema se expone bajo un **nombre de dominio** (por ejemplo
`biblioteca.midominio.com`), que se asocia a la IP del servidor mediante un registro DNS
(un `A`/`AAAA` o un `CNAME`). Eso resuelve el "cómo me encuentran"; falta el "cómo confían
en mí", que es **HTTPS**.

HTTPS cifra el tráfico y autentica al servidor mediante un **certificado TLS** emitido por
una autoridad certificadora (CA). Hoy lo habitual es obtenerlo gratis con **Let's Encrypt**,
que valida que controlás el dominio (vía un desafío HTTP o DNS) y emite un certificado de
corta duración que se **renueva automáticamente**. En la práctica no se mete el certificado
"dentro" de la app: se termina el TLS en el borde, en un **reverse proxy** (Nginx, Caddy,
Traefik) o en un balanceador de carga gestionado. Caddy y Traefik incluso piden y renuevan
los certificados solos. La app sigue hablando HTTP en texto plano dentro de la red privada,
y el proxy se ocupa del cifrado de cara a Internet.

## ¿Cómo se manejan los secretos?

La regla base es: **los secretos no van en el código ni en el repositorio**. En este
proyecto eso se ve en varios lugares: el `JWT_SECRET` y la contraseña de la base se leen del
entorno (`loadConfig`), el `.gitignore` excluye los `.env`, y se versiona solo un
`.env.example` con valores de ejemplo. En `docker-compose`, los valores se inyectan por
variables de entorno y se interpolan desde un `.env` local que no se commitea.

Eso alcanza para desarrollo, pero en producción tiene límites: las variables de entorno son
visibles para cualquiera que pueda inspeccionar el proceso o el `docker inspect`. Por eso, en
un despliegue serio se usan **gestores de secretos**: Docker Secrets / Swarm, Kubernetes
Secrets, o servicios dedicados como HashiCorp Vault, AWS Secrets Manager o GCP Secret
Manager. La idea es que el secreto se monte en tiempo de ejecución (como archivo o variable
efímera), se pueda **rotar** sin reconstruir la imagen, y quede fuera del control de
versiones y de las imágenes de Docker. También conviene generar secretos largos y aleatorios
(no el `cambiar-en-produccion` del ejemplo) y dar a cada servicio solo los que necesita.

## ¿Qué es un reverse proxy?

Un **reverse proxy** es un servidor que se pone delante de una o varias aplicaciones y recibe
las peticiones de los clientes para reenviarlas al servicio interno correspondiente,
devolviendo luego la respuesta. A diferencia de un proxy "normal" (que representa al cliente),
el reverse proxy representa al servidor: el cliente cree estar hablando con una sola dirección.

En este proyecto ya hay un ejemplo concreto: Nginx, además de servir los archivos estáticos
del frontend, **proxea** las rutas `/api/` hacia el servicio `backend`. Así el navegador hace
todas las llamadas al mismo origen y se evitan problemas de CORS; el frontend ni siquiera
necesita saber en qué host vive la API.

En producción, el reverse proxy concentra varias responsabilidades transversales: **terminación
TLS** (HTTPS), **enrutamiento** por host o por path hacia distintos servicios, **balanceo de
carga** entre réplicas, *rate limiting*, compresión, cacheo y cabeceras de seguridad. Tenerlo
en el borde permite que las aplicaciones internas se mantengan simples, hablen HTTP plano en la
red privada y no se expongan directamente a Internet.

## Cierre

Mirando las tres etapas juntas, la lección que más se repite es el valor de mantener el
**dominio independiente de la infraestructura**. Esa decisión, que al principio parece pura
ceremonia, es la que permitió cambiar de almacenamiento (memoria → PostgreSQL), agregar HTTP
y JWT, y empaquetar todo en contenedores sin reescribir la lógica de negocio. La arquitectura
limpia y el TDD no fueron un costo: fueron lo que hizo barato cada cambio posterior.

> Pendiente operativo: en este entorno no pude ejecutar las suites de tests ni levantar el
> `docker compose` (limitación de herramientas). Los pasos de verificación son
> `pnpm install && pnpm -r test` y `docker compose up --build`.
