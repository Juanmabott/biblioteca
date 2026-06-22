# Reflexión — Actividad Final 1 (Dominio + Backend)

## El proceso de desarrollo

Encaré el sistema de biblioteca empezando por el centro y avanzando hacia afuera:
primero el modelo de dominio (entidades, reglas e invariantes), después los casos de
uso que orquestan esas reglas, y recién al final la infraestructura (el backend Express,
los repositorios, la autenticación). Cada pieza del dominio nació de un test: escribir
primero el comportamiento esperado y después la implementación mínima para satisfacerlo.
Ese orden —entidad, puerto, caso de uso— se repitió como un ritmo y dio una sensación de
progreso muy concreta: en todo momento sabía qué faltaba y qué ya estaba cubierto.

La arquitectura limpia se tradujo en una regla simple y estricta: el dominio no importa
nada de afuera. No conoce Express, ni bcrypt, ni JWT, ni la base de datos. Todo lo que el
dominio necesita del mundo exterior lo expresa como una interfaz (un "puerto"):
`LibroRepository`, `PasswordHasher`, `Clock`, `IdGenerator`. La infraestructura, en el
backend, provee las implementaciones concretas. El resultado es que pude desarrollar y
testear la lógica de negocio entera con repositorios en memoria, sin levantar un servidor
ni una base de datos.

## Lo que resultó más difícil o confuso

La parte que más me hizo pensar fue **decidir dónde vive cada responsabilidad**. Por
ejemplo, la fecha actual: al principio era tentador que la entidad `Prestamo` consultara
`new Date()` para saber si estaba vencida. Pero eso vuelve a la entidad no determinista y
difícil de testear. La solución fue invertir el control: la entidad recibe la fecha de
referencia como parámetro, y el caso de uso obtiene "ahora" de un puerto `Clock`. En los
tests, un `FixedClock` hace que el tiempo sea predecible. La misma lógica aplicó a la
generación de ids (`IdGenerator`) y al hasheo de contraseñas (`PasswordHasher`): nada de
detalles técnicos dentro del dominio.

Otro punto confuso fue **el manejo del stock al editar un libro**. Editar las copias
totales no es trivial cuando hay copias prestadas: no se puede reducir el total por debajo
de lo que está afuera. Resolverlo me obligó a encapsular esa matemática dentro de la propia
entidad (`Libro.editar`), que preserva las copias prestadas y rechaza estados inválidos, en
lugar de dejar esa regla suelta en el caso de uso o, peor, en el controlador HTTP.

También costó **modelar los errores**. Al principio tenía un único tipo de error, pero al
llegar al backend me di cuenta de que necesitaba distinguir un "no encontrado" de un "no
autorizado" o de una "violación de regla de negocio" para mapearlos a códigos HTTP
distintos. Introduje una jerarquía de errores de dominio (`ValidationError`,
`NotFoundError`, `ForbiddenError`, `ConflictError`, `AuthenticationError`,
`BusinessRuleError`) y un único `errorHandler` en el backend que los traduce a 422, 404,
403, 409 y 401. Esto mantuvo los casos de uso limpios: lanzan errores semánticos del
dominio y la capa HTTP se ocupa de la presentación.

## "Cuando pensé que había terminado…"

Más de una vez di algo por cerrado y apareció una pieza faltante. Cuando tenía las tres
entidades, creí que el dominio estaba listo; al escribir el caso de uso de préstamo me di
cuenta de que faltaban reglas de negocio que no son de una sola entidad: el **límite de
préstamos activos** por socio y el **bloqueo por préstamos vencidos**. Esas reglas viven en
el caso de uso, porque cruzan varias entidades y consultan el repositorio. TDD ayudó acá:
cada regla nueva fue un test que primero fallaba y obligaba a completar la lógica.

Algo parecido pasó con la **seguridad de los datos**. Al exponer la API noté que devolver
la entidad `Usuario` tal cual filtraba el `passwordHash`. Eso me llevó a introducir una capa
de presentación (DTOs) que decide explícitamente qué se serializa. Y al implementar el login
entendí que la autenticación con credenciales válidas pertenece al dominio, pero la emisión
del token JWT es una decisión de infraestructura: el caso de uso `AutenticarUsuario` solo
verifica las credenciales y devuelve el usuario; el backend firma el token.

## Lo que aprendí

La lección más fuerte es que **la arquitectura limpia no es burocracia, es libertad para
cambiar de opinión**. Como la lógica de negocio no depende de la infraestructura, pude
construir todo con repositorios en memoria y dejar la base de datos real para la etapa de
Docker, sin reescribir nada del dominio. Cuando llegue Postgres, solo habrá que escribir una
nueva implementación de los puertos.

Sobre **TDD**, aprendí que su mayor valor no es solo "atrapar bugs", sino que **fuerza a
diseñar desde el uso**. Escribir el test primero me obligaba a pensar la interfaz más cómoda
para quien consume el código antes de comprometerme con una implementación. Los tests también
funcionaron como red de seguridad y como documentación viva: cada regla de negocio quedó
expresada en un caso concreto y legible. El precio es disciplina y algo de fricción inicial,
pero a cambio el código quedó desacoplado, con responsabilidades claras y fácil de extender.

> Nota de honestidad técnica: al momento de escribir esta reflexión, las suites de tests
> están escritas pero todavía no se ejecutaron en verde en este entorno (limitación de
> herramientas, no del código). El paso pendiente es correr `pnpm -r test` y ajustar lo que
> haga falta; la metodología seguida fue de diseño guiado por tests.
