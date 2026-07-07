# Generador de CV — cv-client

## 1. Owner

Leonardozn

## 2. Description

Este proyecto es el **cv-client** (frontend propio) del sistema Generador de CV: la única UI del
sistema, que permite a una persona capturar los datos de su currículum a través de un formulario
y generar un CV en PDF descargable, en distintos diseños. Llama a **auth-service** (identidad,
sesión y cuenta) y a **cv-service** (contenido del CV, catálogos de habilidades/diseños y
generación del PDF).

## 3. Objective

Permitir a un usuario registrarse, iniciar y cerrar sesión, completar cada sección de su CV
(datos personales, perfil, habilidades, formación, experiencia, certificados) mediante un
asistente por pasos, subir una foto de perfil, elegir un diseño (Template), previsualizar el CV y
descargar el PDF generado. También debe ofrecer una sección de cuenta (editar perfil, cambiar
contraseña, recuperar una contraseña olvidada, desactivar la cuenta) y, para un usuario con rol
admin, una sección de administración de los catálogos Skill y Template. Toda la autorización se
resuelve con el token de auth-service enviado como `Authorization: Bearer <token>`.

> Nota de UI — listas flexibles: el formulario debe indicar explícitamente que los **enlaces de
> contacto** y las **habilidades** son listas flexibles: el usuario puede agregar tantas entradas
> como quiera y, en habilidades, escribir libremente además de aceptar las sugerencias del
> catálogo (una habilidad que no figure igual se guarda).
>
> Nota de UI — formulario por pasos (wizard): la captura de datos del CV NO es un formulario
> único y largo, sino un asistente por pasos con navegación adelante/atrás e indicador de
> progreso. Los pasos siguen las secciones del CV: (1) Datos personales (nombre, headline,
> ciudad, foto, enlaces de contacto), (2) Perfil, (3) Habilidades, (4) Formación, (5)
> Experiencia, (6) Certificados y (7) Diseño y descarga (elegir Template, previsualizar y
> descargar el PDF). Cada paso valida sus campos antes de avanzar; los pasos con listas
> (formación, experiencia, certificados, habilidades, enlaces) permiten agregar/editar/eliminar
> varias entradas. Esto es una decisión de presentación del cv-client: los contratos con
> cv-service (CRUD por sección + generación de PDF) no cambian.

## 4. Task List

1. Definir la UI-model del módulo Authentication de auth-service que la UI gestiona: `User`
   (perfil).
2. Definir las UI-models del módulo CurriculumManagement de cv-service: `Curriculum`,
   `Education`, `Experience`, `Certificate`.
3. Definir las UI-models del módulo Catalog de cv-service: `Skill`, `Template`.
4. Implementar el contrato: el cv-client registra un usuario vía auth-service.
5. Implementar el contrato: el cv-client inicia sesión de un usuario vía auth-service (guardar
   el access token y el refresh token).
6. Implementar el contrato: el cv-client renueva la sesión vía auth-service — interceptor HTTP
   que, ante un 401 por access token expirado, renueva con el refresh token y reintenta la
   solicitud; si el refresh también expiró, cierra sesión y redirige al login.
7. Implementar el contrato: el cv-client cierra sesión vía auth-service.
8. Implementar el contrato: el cv-client cambia la contraseña (usuario autenticado) vía
   auth-service.
9. Implementar el contrato: el cv-client solicita recuperar contraseña vía auth-service.
10. Implementar el contrato: el cv-client restablece la contraseña con un token de recuperación
    vía auth-service — página en la ruta `/reset-password` que lee el `token` del query string
    (coincide con `PASSWORD_RESET_URL_BASE` del email).
11. Implementar el contrato: el cv-client gestiona su cuenta vía auth-service (editar perfil,
    desactivar cuenta).
12. Implementar el contrato: el cv-client gestiona un Curriculum vía cv-service (CRUD, con la
    foto de perfil como file upload).
13. Implementar el contrato: el cv-client gestiona entradas de Education / Experience /
    Certificate vía cv-service (CRUD).
14. Implementar el contrato: el cv-client obtiene los catálogos (Skill, Template) vía cv-service
    (lectura pública; escritura restringida a rol admin).
15. Implementar el contrato: el cv-client solicita la generación del PDF vía cv-service.
16. Implementar el Proceso "Guardar Datos del Curriculum" como el asistente por pasos (wizard) de
    7 pasos, sobre las tareas 12–13: navegación adelante/atrás, indicador de progreso, listas
    flexibles (enlaces de contacto, habilidades, formación, experiencia, certificados) y
    validación por paso.
17. Implementar el Proceso "Autocompletar Habilidades y Elegir Diseño": sugerencias de Skill en
    el paso de habilidades y selector de Template en el paso de diseño y descarga.
18. Implementar el Proceso "Generar el PDF del CV": botón de descarga en el paso final,
    manejando la respuesta binaria `application/pdf`.
19. Implementar el Proceso "Administrar Catálogos" (admin): pantalla de administración para
    crear/editar/desactivar Skill y Template, visible solo para el rol admin (el backend
    responde 403 a quien no lo tenga).

## 5. Artifacts

| Artefacto           | Tipo                     | Dueño / Usado por             |
| ------------------- | ------------------------ | ------------------------------ |
| cv-client            | Frontend propio          | auth-service, cv-service      |
| auth-service        | Microservicio propio     | —                              |
| cv-service          | Microservicio propio     | —                              |
| auth-db (MongoDB)   | Base de datos            | auth-service                   |
| cv-db (MongoDB)     | Base de datos            | cv-service                     |
| Resend              | Servicio de terceros     | auth-service                   |

> `auth-service` y `cv-service` son cada uno su propio proyecto backend; este documento incluye
> su lógica y modelos completos porque cv-client los llama a ambos. Resend no es llamado
> directamente por cv-client (solo por auth-service), se lista por completitud del sistema.

## 6. Artifact Objectives

### cv-client (Frontend propio)
Permite a un usuario registrarse, iniciar sesión, cerrar sesión, completar cada sección de su CV
(datos personales, perfil, habilidades, formación, experiencia, certificados), subir una foto de
perfil, elegir un diseño, previsualizar el CV y descargar el PDF generado, llamando a
auth-service y cv-service. También ofrece una sección de cuenta para editar el perfil, cambiar
la contraseña, recuperar una contraseña olvidada y desactivar la cuenta. Un usuario con rol admin
ve además una sección de administración de catálogos para crear, editar y desactivar Skill y
Template.

### auth-service (Microservicio propio)
Maneja el ciclo de vida de identidad y cuenta: registro, inicio y cierre de sesión, validación
de sesión/token, cambio y recuperación de contraseña (por email vía Resend) y gestión de cuenta
(editar perfil, eliminar cuenta). Es el único dueño de la identidad y de los roles de los
usuarios (user/admin) y **define el protocolo de autorización** que los demás servicios deben
seguir (ver Artifact Contracts → Protocolo de autenticación).

### cv-service (Microservicio propio)
Es dueño de todo el contenido del CV (curriculum y sus entradas de formación, experiencia y
certificados) y de los catálogos de habilidades y diseños. Renderiza ese contenido en un PDF
según el diseño elegido. Es **autónomo**: su lógica (CRUD, catálogos, render) funciona por sí
sola aunque auth-service no esté disponible. El único punto de acoplamiento con auth-service es
un **middleware de autenticación enchufable** montado delante de las rutas protegidas; ese
middleware valida el token (siguiendo el protocolo de auth-service) y limita cada CV a su
usuario dueño antes de servir el recurso. Una ruta que no monte el middleware responde sin
validación.

### auth-db (Base de datos)
Almacena roles, usuarios, sus sesiones activas y los tokens de recuperación de contraseña.

### Resend (Servicio de terceros)
Proveedor de correo transaccional. auth-service lo usa para enviar el email con el enlace de
recuperación de contraseña. Se eligió Resend por indicación del usuario.

### cv-db (Base de datos)
Almacena el curriculum de cada usuario y sus entradas relacionadas de formación, experiencia y
certificados, más los catálogos configurables de habilidades (Skill) y diseños (Template).

## 7. Artifact Contracts (donde cv-client es el llamador)

### Convención de códigos de estado (easy-node)

Los servicios generados con easy-node usan un conjunto fijo de códigos en el envelope, manejados
por el paquete `handle-errors` de cada proyecto; los contratos de abajo se ciñen a él (no se usan
códigos como 409):

- **201** create (`POST /<model>`); **200** read/list/update/replace/delete y acciones custom.
- **400** fallo de validación (Zod) o reglas custom de "petición inválida" (p. ej. "email ya
  registrado", "token de recuperación inválido/expirado").
- **404** recurso no encontrado — manejado por `handle-errors`; lo usan las acciones/consultas
  cuando el registro no existe o no es accesible para quien llama (p. ej. curriculum inexistente
  o ajeno, tratado como "no encontrado").
- **401** no autenticado (código de autenticación custom, p. ej. token ausente/ inválido).
- **403** prohibido (código de autorización custom, p. ej. no es el dueño del recurso o no tiene
  rol admin).
- **500** error inesperado; **502** fallo de un upstream (Axios) al llamar a otro microservicio
  o a un tercero.

### Protocolo de autenticación (definido por auth-service)

auth-service es la única autoridad de identidad y **define el protocolo** que cualquier otro
servicio debe seguir para autorizar solicitudes. Ningún otro servicio interpreta el token por su
cuenta:

1. En el login, auth-service emite un par de **tokens opacos** en la `Session`: un **access
   token** de corta duración (`SESSION_TOKEN_DEFAULT_TIME`) y un **refresh token** de larga
   duración (`REFRESH_TOKEN_DEFAULT_TIME`). El formato, las expiraciones, la rotación y la
   revocación son responsabilidad exclusiva de auth-service.
2. El cliente envía el **access token** en cada solicitud a un servicio protegido mediante el
   header `Authorization: Bearer <token>`; cuando expira, obtiene uno nuevo con el refresh token
   vía `POST /auth/refresh` (no reenvía credenciales).
3. Un servicio que recibe una solicitud protegida (p. ej. cv-service) **reenvía el token** a
   auth-service mediante `POST /auth/validate`; nunca lo decodifica ni confía en él localmente
   (este paso lo hace cv-service, no cv-client).
4. auth-service responde con el `User` autenticado (incluyendo `role`) si el token es válido y
   no ha expirado, o 401 en caso contrario.
5. El servicio llamador usa el `user` devuelto para aplicar la autorización a nivel de recurso
   (p. ej. cv-service solo permite operar sobre un `Curriculum` cuyo `user` coincide con el
   autenticado).
6. Ante token ausente, inválido, expirado o auth-service no disponible, se **falla cerrado**
   (fail closed): la solicitud se rechaza como no autorizada.

**Autorización por rol (RBAC).** auth-service es la única fuente de verdad de *quién es* el
usuario y *qué rol* tiene (user/admin). El rol **admin es un superconjunto de user**: toda acción
que puede realizar un user (editar su CV, generar su PDF, gestionar su cuenta, etc.) la puede
realizar también un admin; el admin únicamente suma las capacidades exclusivas (administrar los
catálogos Skill/Template). cv-client debe ocultar o inhabilitar en su UI las acciones exclusivas
de admin para quien no tenga ese rol, sabiendo que el backend igual las rechaza con 403.

### Contrato: el cv-client registra un usuario vía auth-service

- Llamador: cv-client · Llamado: auth-service
- `POST /auth/register` (acción personalizada, no CRUD estándar)
- Cuerpo de la solicitud: `{ name: <string>, email: <string>, password: <string> }`
- Respuesta: `{ success, message, statusCode, content: { user: <User> } }` en caso de éxito
  (`statusCode` 201, es un create); `content: null` con `statusCode` 400 si el email ya está
  registrado (el código custom lo verifica y lanza `BadRequestError`).

### Contrato: el cv-client inicia sesión de un usuario vía auth-service

- Llamador: cv-client · Llamado: auth-service
- `POST /auth/login` (acción personalizada, no CRUD estándar)
- Cuerpo de la solicitud: `{ email: <string>, password: <string> }`
- Respuesta: `{ success, message, statusCode, content: { token: <string>, refreshToken: <string>, user: <User> } }`
  en caso de éxito; `content: null` con `statusCode` 401 si las credenciales son inválidas.
- `token` es el **access token** (se envía como `Authorization: Bearer <token>`); `refreshToken`
  se guarda para renovar el access cuando expire (ver contrato de renovación).

### Contrato: el cv-client renueva la sesión vía auth-service

- Llamador: cv-client · Llamado: auth-service
- `POST /auth/refresh` (acción personalizada, no CRUD estándar)
- Cuerpo de la solicitud: `{ refreshToken: <string> }`
- Respuesta: `{ success, message, statusCode, content: { token: <string>, refreshToken: <string>, user: <User> } }`
  con un nuevo access token (y refresh token rotado) si el refresh token es válido y no ha
  expirado; `content: null` con `statusCode` 401 si es inválido, expirado o ya rotado.
- El cliente lo usa cuando una solicitud protegida devuelve 401 por access token expirado: renueva
  y reintenta. Si el refresh token también expiró, debe volver a iniciar sesión.

### Contrato: el cv-client cierra sesión vía auth-service

- Llamador: cv-client · Llamado: auth-service
- `POST /auth/logout` (acción personalizada, no CRUD estándar)
- Requiere el header `Authorization: Bearer <token>`; auth-service revoca (elimina) la Session de
  ese token.
- Respuesta: `{ success, message, statusCode, content: null }`. Idempotente: un token ya
  inexistente igual responde éxito.

### Contrato: el cv-client cambia la contraseña (usuario autenticado) vía auth-service

- Llamador: cv-client · Llamado: auth-service
- `POST /auth/change-password` (acción personalizada, no CRUD estándar)
- Requiere el header `Authorization: Bearer <token>`.
- Cuerpo de la solicitud: `{ currentPassword: <string>, newPassword: <string> }`
- Respuesta: `{ success, message, statusCode, content: null }` en caso de éxito; `statusCode` 401
  si `currentPassword` no coincide. Al cambiarla, auth-service revoca las demás sesiones del
  usuario.

### Contrato: el cv-client solicita recuperar contraseña vía auth-service

- Llamador: cv-client · Llamado: auth-service
- `POST /auth/forgot-password` (acción personalizada, no CRUD estándar)
- Cuerpo de la solicitud: `{ email: <string> }`
- Respuesta: `{ success, message, statusCode, content: null }`. Responde siempre éxito exista o
  no el email (para no revelar qué correos están registrados); si existe, dispara el envío del
  email de recuperación vía Resend.

### Contrato: el cv-client restablece la contraseña con un token de recuperación vía auth-service

- Llamador: cv-client · Llamado: auth-service
- `POST /auth/reset-password` (acción personalizada, no CRUD estándar)
- Cuerpo de la solicitud: `{ token: <string>, newPassword: <string> }` (el `token` es el
  PasswordResetToken recibido por email, no un token de sesión)
- Respuesta: `{ success, message, statusCode, content: null }` en caso de éxito; `statusCode` 400
  si el token no existe, ya se usó o expiró. Al restablecerla, auth-service revoca las sesiones
  activas del usuario.

### Contrato: el cv-client gestiona su cuenta vía auth-service

- Llamador: cv-client · Llamado: auth-service
- Editar perfil: `PATCH /user/:id` (campos `name`/`email`). Desactivar la propia cuenta:
  `POST /auth/deactivate` (acción personalizada) — marca `User.active = false` y revoca sus
  sesiones. Requiere el header `Authorization: Bearer <token>`; el usuario solo opera sobre su
  propia cuenta (o un admin sobre cualquiera): un no-dueño sin rol admin recibe `statusCode` 403.
  Un admin puede reactivar una cuenta con `PATCH /user/:id` `{ active: true }`.
- Respuesta: `{ success, message, statusCode, content: <User> | null }`.

### Contrato: el cv-client gestiona un Curriculum vía cv-service

- Llamador: cv-client · Llamado: cv-service
- Rutas CRUD estándar para `Curriculum` (`POST /curriculum`, `GET /curriculum`,
  `GET /curriculum/:id`, `PATCH /curriculum/:id`, `DELETE /curriculum/:id`); ver Data Models →
  Curriculum para los campos expuestos. La foto de perfil se envía como archivo (file upload) en
  el create/update; el nombre de archivo almacenado se devuelve en el Curriculum.
- Cada solicitud lleva el token en el header `Authorization: Bearer <token>`; cv-service lo
  valida (ver Protocolo de autenticación) y limita los resultados al usuario autenticado. Existe
  a lo sumo un Curriculum por usuario.
- Respuesta: `{ success, message, statusCode, content: <Curriculum> | [<Curriculum>] }`.

### Contrato: el cv-client gestiona entradas de Education / Experience / Certificate vía cv-service

- Llamador: cv-client · Llamado: cv-service
- Rutas CRUD estándar para `Education`, `Experience` y `Certificate` (p. ej.
  `POST /education`, `PATCH /experience/:id`, `DELETE /certificate/:id`); cada entrada
  referencia a su Curriculum padre. Ver Data Models para los campos expuestos.
- Requiere el header `Authorization: Bearer <token>`; cv-service valida y confirma que el
  Curriculum padre pertenece al usuario autenticado.
- Respuesta: `{ success, message, statusCode, content: <Entry> | [<Entry>] }`.

### Contrato: el cv-client obtiene los catálogos (Skill, Template) vía cv-service

- Llamador: cv-client · Llamado: cv-service
- Rutas CRUD estándar de lectura para `Skill` (`GET /skill`) y `Template` (`GET /template`); el
  cv-client usa `Skill` para autocompletar el campo de habilidades y `Template` para ofrecer el
  selector de diseño. La **lectura es pública** (no requiere rol).
- Las operaciones de **escritura** sobre estos catálogos (`POST`/`PATCH`/`DELETE` de `Skill` y
  `Template`) requieren rol `admin`: cv-service las protege con el middleware configurado como
  `requireRole('admin')` (ver Protocolo de autenticación → Autorización por rol). Excepción: el
  alta automática de una habilidad nueva al guardar un CV la hace el propio cv-service, no
  requiere admin (ver Business Logic → Proceso: Guardar Datos del Curriculum).
- Respuesta: `{ success, message, statusCode, content: [<Skill>] | [<Template>] }`.

### Contrato: el cv-client solicita la generación del PDF vía cv-service

- Llamador: cv-client · Llamado: cv-service
- `POST /curriculum/:id/generate-pdf` (acción personalizada, no CRUD estándar)
- Cuerpo de la solicitud: `{ template: <id de Template> }` (qué diseño usar; si se omite, se usa
  el Template activo por defecto). El id del curriculum va en la ruta; el token va en el header.
- Respuesta: el archivo PDF renderizado como descarga binaria (`Content-Type: application/pdf`),
  generado on-demand y **sin persistir** ningún registro (no hay historial). En caso de error se
  responde el envelope estándar: `content: null` con `statusCode` 401 si la sesión es inválida, o
  404 si el curriculum no existe o no pertenece a quien llama (tratado como "no encontrado", que
  además no revela la existencia de CVs de otros usuarios).

> Otros dos contratos del sistema no aparecen aquí porque cv-client no es el llamador: "cv-service
> valida un token de sesión con auth-service" (llamador: cv-service) y "auth-service envía el
> email de recuperación vía Resend" (llamador: auth-service). Ver el `DOCUMENTATION.md` raíz si
> necesitas su detalle.

## 8. Data Models (de los microservicios que consume)

### auth-service

#### Módulo: Authentication

##### Role

Los roles son datos configurables: se pueden agregar nuevos roles sin cambiar código.

| Campo  | Tipo    | Requerido | Descripción                                |
| ------ | ------- | --------- | ------------------------------------------ |
| id     | id      | sí        | Identificador único del rol                |
| name   | string  | sí        | Nombre del rol (p. ej., user, admin)       |
| active | boolean | sí        | Si el rol puede asignarse actualmente      |

##### User

| Campo     | Tipo             | Requerido | Descripción                    |
| --------- | ---------------- | --------- | ------------------------------- |
| id        | id               | sí        | Identificador único del usuario|
| name      | string           | sí        | Nombre visible del usuario     |
| email     | string           | sí        | Email de inicio de sesión, único|
| password  | string           | sí        | Contraseña hasheada            |
| role      | reference → Role | sí        | Rol asignado al usuario        |
| active    | boolean          | sí        | Si la cuenta está activa (una cuenta desactivada no puede iniciar sesión) |
| createdAt | datetime         | sí        | Fecha de registro              |

##### Session

Cada login crea una Session con un par de tokens opacos: un **access token** de corta duración
(el que viaja como `Authorization: Bearer`) y un **refresh token** de larga duración (para
renovar el access sin volver a pedir credenciales).

| Campo                 | Tipo             | Requerido | Descripción                                             |
| --------------------- | ---------------- | --------- | -------------------------------------------------------- |
| id                    | id               | sí        | Identificador único de la sesión                        |
| user                  | reference → User | sí        | Dueño de la sesión                                      |
| accessToken           | string           | sí        | Token de acceso opaco (Bearer), de corta duración       |
| accessTokenExpiresAt  | datetime         | sí        | Expiración del access token (SESSION_TOKEN_DEFAULT_TIME) |
| refreshToken          | string           | sí        | Token de refresco opaco, de larga duración              |
| refreshTokenExpiresAt | datetime         | sí        | Expiración del refresh token (REFRESH_TOKEN_DEFAULT_TIME)|

#### Módulo: AccountManagement

##### PasswordResetToken

Token de un solo uso para restablecer la contraseña, enviado por email vía Resend.

| Campo     | Tipo             | Requerido | Descripción                                      |
| --------- | ---------------- | --------- | -------------------------------------------------- |
| id        | id               | sí        | Identificador único del token de recuperación    |
| user      | reference → User | sí        | Usuario que solicitó la recuperación             |
| token     | string           | sí        | Token opaco incluido en el enlace del email      |
| expiresAt | datetime         | sí        | Fecha de expiración del token                    |
| used      | boolean          | sí        | Si el token ya fue usado (no se puede reutilizar)|

### cv-service

#### Módulo: CurriculumManagement

##### Curriculum

El documento de contenido del CV. **Existe a lo sumo un Curriculum por usuario** (`user` es
único); los distintos "CV" del usuario son este mismo contenido renderizado en diferentes
diseños. `user` guarda únicamente el id del `User` que vive en auth-service (referencia por id
entre servicios). `photo` almacena únicamente el nombre del archivo subido (file upload), nunca
los bytes del archivo.

| Campo          | Tipo             | Requerido | Descripción                                              |
| -------------- | ---------------- | --------- | ---------------------------------------------------------- |
| id             | id               | sí        | Identificador único del curriculum                       |
| user           | reference → User | sí        | Dueño, único (id del User en auth-service)               |
| fullName       | string           | sí        | Nombre completo mostrado como título del CV              |
| headline       | string           | sí        | Titular/eslogan profesional bajo el nombre               |
| city           | string           | sí        | Ciudad / ubicación (Datos personales)                    |
| photo          | string           | no        | Nombre de archivo de la foto de perfil (file upload)     |
| profileSummary | string           | sí        | Texto libre del "Perfil"                                 |
| skills         | array of string  | no        | Nombres de habilidades del sidebar (texto libre; el catálogo Skill solo sugiere) |
| contactLinks   | array of object  | no        | Enlaces de contacto/redes bajo Datos personales          |
| createdAt      | datetime         | sí        | Fecha de creación                                        |
| updatedAt      | datetime         | sí        | Fecha de última actualización                            |

###### Curriculum.contactLinks (cada entrada)

| Campo | Tipo   | Requerido | Descripción                                    |
| ----- | ------ | --------- | ------------------------------------------------ |
| label | string | sí        | Etiqueta del enlace (p. ej., LinkedIn, GitHub) |
| url   | string | sí        | La URL o usuario del enlace                    |

##### Education

| Campo       | Tipo                   | Requerido | Descripción                                   |
| ----------- | ---------------------- | --------- | ------------------------------------------------ |
| id          | id                     | sí        | Identificador único de la entrada de formación|
| curriculum  | reference → Curriculum | sí        | Curriculum padre                              |
| title       | string                 | sí        | Título del grado / programa                   |
| institution | string                 | sí        | Nombre de la institución o centro educativo   |
| startDate   | date                   | sí        | Fecha de inicio                               |
| endDate     | date                   | no        | Fecha de fin (vacío significa en curso)       |

##### Experience

| Campo       | Tipo                   | Requerido | Descripción                                    |
| ----------- | ---------------------- | --------- | -------------------------------------------------- |
| id          | id                     | sí        | Identificador único de la entrada de experiencia|
| curriculum  | reference → Curriculum | sí        | Curriculum padre                               |
| position    | string                 | sí        | Cargo / rol                                    |
| company     | string                 | sí        | Nombre de la empresa / empleador               |
| location    | string                 | no        | Ciudad / país del empleo                       |
| startDate   | date                   | sí        | Fecha de inicio                                |
| endDate     | date                   | no        | Fecha de fin (vacío significa empleo actual)   |
| description | string                 | sí        | Descripción de responsabilidades / logros      |

##### Certificate

| Campo      | Tipo                   | Requerido | Descripción                       |
| ---------- | ---------------------- | --------- | ------------------------------------ |
| id         | id                     | sí        | Identificador único del certificado|
| curriculum | reference → Curriculum | sí        | Curriculum padre                  |
| name       | string                 | sí        | Nombre del certificado / curso    |
| date       | date                   | sí        | Fecha de obtención                |

#### Módulo: Catalog

##### Skill

Catálogo configurable de habilidades para autocompletar. Alimenta las sugerencias del
formulario; el usuario también puede escribir habilidades que no estén en el catálogo, y
cv-service puede agregar las nuevas al catálogo para que crezcan las sugerencias.

| Campo  | Tipo    | Requerido | Descripción                                   |
| ------ | ------- | --------- | ------------------------------------------------ |
| id     | id      | sí        | Identificador único de la habilidad           |
| name   | string  | sí        | Nombre de la habilidad (p. ej., Node.js)      |
| active | boolean | sí        | Si la habilidad se ofrece como sugerencia     |

##### Template

Catálogo configurable de diseños de CV disponibles. Actualmente contiene un diseño (el de dos
columnas del ejemplo); se pueden agregar más sin cambiar código.

| Campo       | Tipo    | Requerido | Descripción                                                  |
| ----------- | ------- | --------- | ---------------------------------------------------------------- |
| id          | id      | sí        | Identificador único del diseño                               |
| name        | string  | sí        | Nombre visible del diseño (p. ej., "Clásico dos columnas")   |
| key         | string  | sí        | Clave técnica que el renderizador usa para elegir el componente de diseño (react-pdf) |
| description | string  | no        | Descripción breve del diseño                                 |
| active      | boolean | sí        | Si el diseño está disponible para elegir                     |

## 9. Business Logic (de los microservicios que consume)

La UI orquesta estos flujos llamando a los contratos de la sección 7; el detalle y las reglas
viven en cada microservicio.

### auth-service

#### Módulo: Authentication
Usa: Role, User, Session
Responsabilidad: Registrar y autenticar usuarios, emitir y renovar los tokens de sesión
(access + refresh), cerrar sesión y validar tokens para otros servicios, siendo la autoridad del
Protocolo de autenticación.

#### Proceso: Registrar un Usuario
Disparador: Un visitante envía el formulario de registro en el cv-client (ver Artifact Contracts
→ "el cv-client registra un usuario vía auth-service").

1. El módulo Authentication recibe name, email y password.
2. Resuelve el Role activo por defecto ("user") en auth-db.
3. Verifica en auth-db si ya existe un User con el mismo email.
4. Si el email existe → devuelve error 400 (BadRequestError), no se crea ningún User.
5. Hashea la contraseña y crea un User referenciando el Role resuelto.

Resultado: Un User capaz de iniciar sesión, o un error si el email ya estaba tomado.

#### Proceso: Iniciar Sesión de un Usuario
Disparador: Un visitante envía el formulario de login en el cv-client (ver Artifact Contracts →
"el cv-client inicia sesión de un usuario vía auth-service").

1. El módulo Authentication recibe email y password.
2. Busca el User por email en auth-db.
3. Si no coincide ningún User, o el hash de la contraseña no coincide → devuelve error 401, no
   se emite token.
4. Si el User está desactivado (`active = false`) → devuelve error 403 ("cuenta desactivada"), no
   se emite token.
5. Crea una Session referenciando al User con un access token (expira en
   `SESSION_TOKEN_DEFAULT_TIME`) y un refresh token (expira en `REFRESH_TOKEN_DEFAULT_TIME`), y
   devuelve ambos.

Resultado: Un access token (para `Authorization: Bearer`) y un refresh token (para renovarlo),
que el cv-client almacena; o un error ante credenciales inválidas.

#### Proceso: Refrescar la Sesión
Disparador: El cv-client detecta un access token expirado (401) y envía el refresh token (ver
Artifact Contracts → "el cv-client renueva la sesión vía auth-service").

1. El módulo Authentication recibe el refresh token.
2. Busca una Session cuyo `refreshToken` coincida y cuyo `refreshTokenExpiresAt` no haya vencido.
3. Si no la encuentra (inexistente, expirado o ya rotado) → devuelve 401, sin renovar.
4. Genera un nuevo access token y rota el refresh token, actualizando sus expiraciones en la
   Session, y devuelve ambos con el User.

Resultado: Un nuevo par access/refresh, o 401 si el refresh token no es válido (hay que volver a
iniciar sesión).

#### Proceso: Cerrar Sesión
Disparador: Un usuario autenticado cierra sesión (ver Artifact Contracts → "el cv-client cierra
sesión vía auth-service").

1. El módulo Authentication recibe el access token del header.
2. Elimina la Session cuyo `accessToken` coincida en auth-db, si existe (revoca también su refresh
   token).

Resultado: La sesión queda revocada (access y refresh); futuras validaciones devuelven 401.
Idempotente.

#### Proceso: Validar un Token
Disparador: cv-service reenvía el token de quien llama a auth-service, según el Protocolo de
autenticación (llamada interna entre microservicios, no la hace cv-client directamente).

1. El módulo Authentication recibe el token (access token).
2. Busca una Session cuyo `accessToken` coincida y cuyo `accessTokenExpiresAt` no haya vencido.
3. Si no encuentra ninguna (inexistente o access token expirado) → devuelve 401, content null.
4. Si la encuentra → devuelve el User referenciado (incluyendo su role).

Resultado: El User autenticado, o una respuesta de no autorizado. auth-service es el único que
decide la validez del token. cv-client debe saber que un 401 devuelto por cv-service puede venir
de este paso (sesión inválida) tanto como de una llamada directa a auth-service.

#### Módulo: AccountManagement
Usa: User, Session, PasswordResetToken, Resend (terceros)
Responsabilidad: Cambiar y recuperar la contraseña, y gestionar la cuenta (editar perfil,
eliminar cuenta), siempre sobre la propia cuenta del usuario autenticado (o un admin sobre
cualquiera).

#### Proceso: Cambiar Contraseña
Disparador: Un usuario autenticado cambia su contraseña (ver Artifact Contracts → "el cv-client
cambia la contraseña (usuario autenticado) vía auth-service").

1. El módulo recibe currentPassword y newPassword, con el token en el header.
2. Valida la sesión y ubica al User; verifica que currentPassword coincide con el hash guardado.
3. Si no coincide → devuelve 401, no se cambia nada.
4. Hashea newPassword, actualiza el User y revoca las demás Session del usuario (deja viva la
   actual).

Resultado: Contraseña actualizada y otras sesiones cerradas, o un error si la actual no coincide.

#### Proceso: Solicitar Recuperación de Contraseña
Disparador: Un visitante pide recuperar su contraseña (ver Artifact Contracts → "el cv-client
solicita recuperar contraseña vía auth-service").

1. El módulo recibe el email.
2. Busca el User por email en auth-db.
3. Si existe → crea un PasswordResetToken (token opaco, expiresAt, used = false) y envía por
   Resend un email con el enlace de restablecimiento.
4. Exista o no el email, responde éxito (no revela qué correos están registrados).

Resultado: Si el email existe, el usuario recibe un enlace de recuperación; la respuesta es la
misma en ambos casos.

#### Proceso: Restablecer Contraseña
Disparador: El usuario abre el enlace del email y envía la nueva contraseña (ver Artifact
Contracts → "el cv-client restablece la contraseña con un token de recuperación vía
auth-service").

1. El módulo recibe el token de recuperación y newPassword.
2. Busca un PasswordResetToken con ese token que no esté usado ni expirado.
3. Si no lo encuentra (inexistente, usado o expirado) → devuelve 400.
4. Hashea newPassword y actualiza el User referenciado; marca el token como used = true y revoca
   las Session activas del usuario.

Resultado: Contraseña restablecida y sesiones cerradas, o un error si el token no es válido.

#### Proceso: Editar Perfil / Desactivar Cuenta
Disparador: Un usuario autenticado edita su perfil o desactiva su cuenta (ver Artifact Contracts
→ "el cv-client gestiona su cuenta vía auth-service").

1. El módulo valida la sesión e identifica al User autenticado.
2. Para editar perfil (`PATCH /user/:id`), confirma que el `:id` es el propio usuario (o admin);
   si no, 403. Actualiza name/email, rechazando un email ya tomado por otro User.
3. Para desactivar (`POST /auth/deactivate`), marca `User.active = false` y revoca (elimina) las
   Session y PasswordResetToken del usuario. Un admin puede reactivar con `PATCH /user/:id`
   `{ active: true }`.

Resultado: El perfil actualizado o la cuenta desactivada, o un error de autorización/validación.

### cv-service

#### Módulo: CurriculumManagement
Usa: Curriculum, Education, Experience, Certificate, Skill, (referencia) User
Responsabilidad: Permitir a un usuario crear y editar su único curriculum y todas sus
sub-entradas, limitando cada registro a su User dueño (resuelto vía el Protocolo de
autenticación).

#### Módulo: Catalog
Usa: Skill, Template
Responsabilidad: Mantener y exponer los catálogos configurables de habilidades (para
autocompletar) y de diseños (para el selector de plantilla). La lectura es pública; la escritura
(alta/edición/baja de Skill y Template) la realiza un admin, salvo el alta automática de
habilidades nuevas al guardar un CV.

#### Proceso: Administrar Catálogos (admin)
Disparador: Un admin crea/edita/elimina una Skill o un Template (ver Artifact Contracts → "el
cv-client obtiene los catálogos (Skill, Template) vía cv-service").

1. La ruta de escritura está protegida por el middleware configurado como `requireRole('admin')`,
   que valida el token con auth-service y exige rol admin (ver Protocolo de autenticación →
   Autorización por rol); un usuario sin rol admin recibe no autorizado.
2. Con rol admin validado, el módulo Catalog aplica el alta/edición/baja sobre Skill o Template
   en cv-db.

Resultado: El catálogo actualizado, o un error de autorización si quien llama no es admin.

#### Módulo: PdfGeneration
Usa: Curriculum, Education, Experience, Certificate, Template
Responsabilidad: Renderizar un curriculum y sus entradas en un PDF según el Template elegido,
generándolo on-demand y sin persistir historial.

#### Proceso: Guardar Datos del Curriculum
Disparador: Un usuario crea o actualiza su CV desde el cv-client (ver Artifact Contracts → "el
cv-client gestiona un Curriculum vía cv-service" y "... entradas de Education / Experience /
Certificate ...").

1. CurriculumManagement recibe la solicitud con el token en el header `Authorization`.
2. El middleware de autenticación montado en la ruta valida el token con auth-service (Protocolo
   de autenticación) e inyecta el `user`; un token inválido se rechaza como no autorizado.
3. Si el usuario ya tiene un Curriculum, la operación actualiza ese; si no, crea el primero
   (máximo uno por usuario).
4. En un create/update de Curriculum, si se incluye un archivo de foto, se guarda y su nombre
   se almacena en Curriculum.photo.
5. El Curriculum (o la entrada de Education/Experience/Certificate) se crea o actualiza en
   cv-db, referenciando siempre al User autenticado (para Curriculum) o al Curriculum padre
   (para las entradas), y nunca un curriculum de otro usuario.
6. Por cada habilidad de `skills` que no exista en el catálogo Skill, se agrega una entrada
   activa nueva, de modo que el catálogo de sugerencias crece con el uso.
7. Curriculum.updatedAt se refresca ante cualquier cambio en el curriculum o sus entradas.

Resultado: El curriculum/entrada persistido, o un error de no autorizado/validación.

#### Proceso: Autocompletar Habilidades y Elegir Diseño
Disparador: El cv-client carga el formulario del CV (ver Artifact Contracts → "el cv-client
obtiene los catálogos (Skill, Template) vía cv-service").

1. El módulo Catalog devuelve las Skill activas para poblar las sugerencias del campo de
   habilidades; el usuario puede aceptar una sugerencia o escribir una nueva libremente.
2. El módulo Catalog devuelve los Template activos para poblar el selector de diseño.

Resultado: El formulario ofrece autocompletado de habilidades y la lista de diseños disponibles.

#### Proceso: Generar el PDF del CV
Disparador: Un usuario hace clic en "descargar PDF" para su curriculum, eligiendo un diseño (ver
Artifact Contracts → "el cv-client solicita la generación del PDF vía cv-service").

1. PdfGeneration recibe el id del curriculum, el id de Template (o usa el activo por defecto) y
   el token.
2. El middleware de autenticación valida el token con auth-service e inyecta el `user`;
   PdfGeneration confirma que el Curriculum pertenece al User autenticado; de lo contrario
   devuelve un 404 (no encontrado para este usuario).
3. Carga el Curriculum más sus entradas de Education, Experience y Certificate desde cv-db, y
   resuelve el Template elegido (su `key` indica qué componente de diseño react-pdf usar).
4. Renderiza el PDF con el componente de diseño del Template: sidebar con nombre, headline, foto,
   datos personales (city, contactLinks) y habilidades; columna principal con Perfil
   (profileSummary), Formación (Education), Experiencia (Experience) y Certificados
   (Certificate).
5. Devuelve el archivo PDF como descarga binaria, sin persistir ningún registro.

Resultado: Un PDF descargable con el diseño elegido, o un 404 (no encontrado) si el curriculum no
es de quien llama.

## 10. Endpoints y Acceso a los Servicios

Complementa la Sección 7 (que describe cada contrato en prosa) con un índice plano de todos los
endpoints de auth-service y cv-service que cv-client conoce y puede llamar, más la configuración
con la que los alcanza.

### Configuración de acceso (variables de entorno de Vite)

cv-client compone la URL de cada servicio como `<HOST><PATH>`, leído de `src/config/environment`:

| Servicio     | Variable de host          | Variable de prefijo      | Valor efectivo (`cv-client/.env`) |
| ------------ | -------------------------- | -------------------------- | ---------------------------------- |
| auth-service | `VITE_AUTH_API_HOST`       | `VITE_AUTH_API_PATH`       | `http://localhost:3000` + `/api` (default) |
| cv-service   | `VITE_CV_API_HOST`         | `VITE_CV_API_PATH`         | `http://localhost:3001` + `/api` (default) |

`VITE_AUTH_STATIC_IMAGES_HOST`/`VITE_AUTH_IMAGES_API_PATH` y
`VITE_CV_STATIC_IMAGES_HOST`/`VITE_CV_IMAGES_API_PATH` resuelven, de la misma forma, la URL desde
la que se sirven los archivos subidos (p. ej. `Curriculum.photo`) de cada servicio.

Todas las solicitudes a rutas protegidas envían `Authorization: Bearer <accessToken>`; ante un 401
por access token expirado, la conexión reintenta una vez tras renovar contra
`<AUTH_API_HOST><AUTH_API_PATH>/auth/refresh` (nunca contra cv-service, que no expone su propia
ruta de refresh — ver Protocolo de autenticación).

### Endpoints de auth-service (prefijo `<AUTH_API_HOST><AUTH_API_PATH>`)

| Método | Ruta                     | Operación                                    |
| ------ | ------------------------ | --------------------------------------------- |
| POST   | `/auth/register`         | Registrar usuario                             |
| POST   | `/auth/login`            | Iniciar sesión                                |
| POST   | `/auth/refresh`          | Renovar sesión (access + refresh)             |
| POST   | `/auth/logout`           | Cerrar sesión                                 |
| POST   | `/auth/change-password`  | Cambiar contraseña (usuario autenticado)      |
| POST   | `/auth/forgot-password`  | Solicitar recuperación de contraseña          |
| POST   | `/auth/reset-password`   | Restablecer contraseña con token de recuperación |
| POST   | `/auth/deactivate`       | Desactivar la propia cuenta                   |
| GET    | `/user`                  | Listar usuarios (CRUD estándar del modelo `User`; sin un proceso de negocio propio documentado — solo admin) |
| POST   | `/user`                  | Crear usuario (CRUD estándar; el alta pública real es `/auth/register`, no esta ruta) |
| GET    | `/user/:id`              | Leer un usuario                               |
| PATCH  | `/user/:id`              | Editar perfil (`name`/`email`) o reactivar una cuenta (`{ active: true }`, admin) |
| PUT    | `/user/:id`              | Reemplazar usuario (CRUD estándar; sin proceso de negocio propio) |
| DELETE | `/user/:id`              | Eliminar usuario (CRUD estándar; la baja de negocio es `/auth/deactivate`, no esta ruta) |

> Las filas de `/user` marcadas "CRUD estándar" existen porque `User` es una UI-model generada en
> cv-client, pero solo `GET/PATCH /user/:id` tienen un contrato y un proceso de negocio
> documentados (ver Sección 7 y Sección 9); el resto no debe exponerse en la UI de un usuario
> normal salvo que se decida construir una pantalla de administración de usuarios (fuera del
> alcance definido hoy).

### Endpoints de cv-service (prefijo `<CV_API_HOST><CV_API_PATH>`)

| Método | Ruta                              | Operación                                      |
| ------ | ---------------------------------- | ------------------------------------------------ |
| POST   | `/curriculum`                     | Crear el Curriculum del usuario autenticado     |
| GET    | `/curriculum`                     | Listar (a lo sumo un Curriculum por usuario)    |
| GET    | `/curriculum/:id`                 | Leer un Curriculum                              |
| PATCH  | `/curriculum/:id`                 | Actualizar el Curriculum (incluye foto, file upload) |
| PUT    | `/curriculum/:id`                 | Reemplazar el Curriculum                        |
| DELETE | `/curriculum/:id`                 | Eliminar el Curriculum                          |
| POST   | `/curriculum/:id/generate-pdf`    | Generar y descargar el PDF                      |
| POST   | `/education`                      | Crear una entrada de Education                  |
| GET    | `/education`                      | Listar entradas de Education                    |
| GET    | `/education/:id`                  | Leer una entrada de Education                   |
| PATCH  | `/education/:id`                  | Actualizar una entrada de Education             |
| PUT    | `/education/:id`                  | Reemplazar una entrada de Education             |
| DELETE | `/education/:id`                  | Eliminar una entrada de Education               |
| POST / GET / GET :id / PATCH / PUT / DELETE | `/experience`, `/experience/:id` | CRUD de Experience (mismas seis operaciones que Education) |
| POST / GET / GET :id / PATCH / PUT / DELETE | `/certificate`, `/certificate/:id` | CRUD de Certificate (mismas seis operaciones que Education) |
| GET    | `/skill`                          | Listar Skill activas (lectura pública)          |
| POST   | `/skill`                          | Crear Skill (admin)                             |
| GET    | `/skill/:id`                      | Leer una Skill                                  |
| PATCH  | `/skill/:id`                      | Actualizar una Skill (admin)                    |
| PUT    | `/skill/:id`                      | Reemplazar una Skill (admin)                    |
| DELETE | `/skill/:id`                      | Eliminar una Skill (admin)                      |
| GET    | `/template`                       | Listar Template activos (lectura pública)       |
| POST   | `/template`                       | Crear Template (admin)                          |
| GET    | `/template/:id`                   | Leer un Template                                |
| PATCH  | `/template/:id`                   | Actualizar un Template (admin)                  |
| PUT    | `/template/:id`                   | Reemplazar un Template (admin)                  |
| DELETE | `/template/:id`                   | Eliminar un Template (admin)                    |

Todas las rutas de `/skill` y `/template` distintas de `GET` exigen rol admin (ver Artifact
Contracts → "el cv-client obtiene los catálogos (Skill, Template) vía cv-service").
