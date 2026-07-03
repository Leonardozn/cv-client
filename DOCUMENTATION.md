# Generador de CV — cv-client

## 1. Owner

Leonardozn

## 2. Description

Este proyecto es el **cv-client** (frontend Vite + React) del sistema Generador de CV: la UI que
consumen los usuarios finales. Llama a **auth-service** (identidad, sesión, cuenta) y a
**cv-service** (contenido del CV, catálogos y generación de PDF). Permite registrarse, iniciar
sesión, capturar los datos del CV mediante un **asistente por pasos (wizard)**, elegir un diseño,
previsualizar y descargar el PDF, gestionar la cuenta y (para admins) administrar los catálogos.

## 3. Objective

Ofrecer una experiencia guiada para producir un CV en PDF: autenticación (registro/login/
recuperación), un wizard de captura de datos por secciones con listas flexibles, selección de
diseño y descarga del PDF, más la gestión de cuenta y la administración de catálogos para el rol
admin. Toda la autorización se delega en el token de auth-service enviado como
`Authorization: Bearer <token>`.

> Notas de UI (obligatorias):
> - **Listas flexibles**: enlaces de contacto y habilidades son listas donde el usuario agrega
>   varias entradas; en habilidades puede escribir libremente además de aceptar sugerencias del
>   catálogo Skill (una habilidad que no figure igual se guarda). El formulario debe indicarlo.
> - **Wizard por pasos**: la captura del CV NO es un formulario único y largo, sino un asistente
>   con navegación adelante/atrás e indicador de progreso. Pasos: (1) Datos personales (nombre,
>   headline, ciudad, foto, enlaces de contacto), (2) Perfil, (3) Habilidades, (4) Formación,
>   (5) Experiencia, (6) Certificados, (7) Diseño y descarga (elegir Template, previsualizar,
>   descargar PDF). Cada paso valida sus campos antes de avanzar.

## 4. Task List

> Códigos de estado que devolverán los servicios (paquete `handle-errors`): 201/200, 400
> (validación/regla custom, p. ej. email duplicado, token de recuperación inválido), 404 (no
> encontrado), 401 (no autenticado), 403 (prohibido / sin rol admin), 500/502.

1. Definir las UI-models de auth-service que la UI gestiona: `User` (perfil/registro).
2. Definir las UI-models de cv-service que la UI gestiona: `Curriculum`, `Education`,
   `Experience`, `Certificate`, `Skill`, `Template`.
3. Implementar autenticación: pantallas de registro (`POST /auth/register`) y login
   (`POST /auth/login`); guardar el **access token** y el **refresh token**, y enviar el access
   como `Authorization: Bearer`.
4. Implementar la renovación de sesión: ante un 401 por access token expirado, llamar a
   `POST /auth/refresh` con el refresh token, actualizar los tokens y reintentar la solicitud;
   si el refresh también expiró, cerrar sesión y redirigir al login (idealmente un interceptor
   HTTP centralizado).
5. Implementar recuperación de contraseña: solicitar (`POST /auth/forgot-password`) y una página
   de restablecimiento en la ruta `/reset-password` (que coincide con `PASSWORD_RESET_URL_BASE`
   del email) que lee el `token` del query y llama a `POST /auth/reset-password`.
6. Implementar sesión y cuenta: cerrar sesión (`POST /auth/logout`), cambiar contraseña
   (`POST /auth/change-password`), editar perfil (`PATCH /user/:id`) y desactivar cuenta
   (`POST /auth/deactivate`).
7. Implementar el wizard del CV (7 pasos) sobre el CRUD de `Curriculum` y sus entradas
   `Education` / `Experience` / `Certificate`, con subida de foto y listas flexibles.
8. Implementar el autocompletado de habilidades (`GET /skill`) y el selector de diseño
   (`GET /template`).
9. Implementar la generación y descarga del PDF (`POST /curriculum/:id/generate-pdf`,
   respuesta `application/pdf`).
10. Implementar la administración de catálogos para admin (escritura de `Skill` y `Template`;
    ocultar/inhabilitar para usuarios sin rol admin, ya que el backend responde 403).

## 5. Artifacts

| Artefacto           | Tipo                     | Dueño / Usado por             |
| ------------------- | ------------------------ | ----------------------------- |
| cv-client           | Frontend propio          | auth-service, cv-service      |
| auth-service        | Microservicio propio     | —                             |
| cv-service          | Microservicio propio     | —                             |
| auth-db (MongoDB)   | Base de datos            | auth-service                  |
| cv-db (MongoDB)     | Base de datos            | cv-service                    |
| Resend              | Servicio de terceros     | auth-service                  |

## 6. Artifact Objectives

### cv-client (Frontend propio)
La UI para registrarse, iniciar sesión, completar el CV por pasos, subir foto, elegir diseño,
previsualizar y descargar el PDF, y gestionar la cuenta; los admins además administran catálogos.

### auth-service (Microservicio propio)
Único dueño de la identidad y roles (user/admin); registro, sesión, cuenta y validación de token.
Define el Protocolo de autenticación.

### cv-service (Microservicio propio)
Dueño del contenido del CV y de los catálogos Skill/Template; genera el PDF según el diseño.
Valida el token contra auth-service mediante un middleware.

### auth-db / cv-db (Bases de datos)
MongoDB de cada microservicio.

### Resend (Servicio de terceros)
Proveedor de correo que auth-service usa para el email de recuperación (el cv-client no lo llama
directamente).

## 7. Artifact Contracts (donde el cv-client es llamador)

### Convención de códigos de estado (easy-node)
Manejados por `handle-errors`: **201** create; **200** demás/acciones custom; **400**
validación/regla custom; **404** no encontrado; **401** no autenticado; **403** prohibido;
**500/502** error/upstream. No hay 409 (email duplicado → 400).

### auth-service
- **Registrar**: `POST /auth/register` — `{ name, email, password }` → `{ content: { user } }`
  (201); 400 si el email ya existe.
- **Login**: `POST /auth/login` — `{ email, password }` → `{ content: { token, refreshToken, user } }`;
  401 si credenciales inválidas. `token` es el access token (`Authorization: Bearer <token>`);
  `refreshToken` se guarda para renovar.
- **Refrescar**: `POST /auth/refresh` — `{ refreshToken }` → `{ content: { token, refreshToken, user } }`
  (access nuevo + refresh rotado); 401 si el refresh es inválido/expirado (→ re-login). Usarlo
  ante 401 por access expirado y reintentar la solicitud.
- **Logout**: `POST /auth/logout` (Bearer) → 200 `content: null`. Idempotente.
- **Cambiar contraseña**: `POST /auth/change-password` (Bearer) — `{ currentPassword, newPassword }`
  → 200; 401 si la actual no coincide.
- **Olvidé contraseña**: `POST /auth/forgot-password` — `{ email }` → 200 siempre (no revela
  correos).
- **Restablecer**: `POST /auth/reset-password` — `{ token, newPassword }` → 200; 400 si el token
  es inválido/usado/expirado.
- **Cuenta**: editar perfil `PATCH /user/:id` (name/email) y desactivar `POST /auth/deactivate`
  (Bearer); solo la propia cuenta o admin → 403 si no. Un login de cuenta desactivada devuelve 403
  ("cuenta desactivada").

### cv-service (todas con `Authorization: Bearer <token>`)
- **Curriculum**: CRUD estándar `POST/GET/GET :id/PATCH/DELETE /curriculum`. Foto como file
  upload; máximo un Curriculum por usuario; resultados limitados al usuario.
- **Entradas**: CRUD estándar de `Education`, `Experience`, `Certificate` (referencian su
  Curriculum padre).
- **Catálogos**: `GET /skill`, `GET /template` (lectura pública). Escritura de `Skill`/`Template`
  requiere rol admin (403 si no).
- **Generar PDF**: `POST /curriculum/:id/generate-pdf` — `{ template: <id> }` (opcional) →
  descarga `application/pdf`; 401 si sesión inválida; 404 si el curriculum no existe o no es del
  usuario.

## 8. Data Models (de los microservicios que consume)

### auth-service → User
| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| id | id | sí | Identificador único |
| name | string | sí | Nombre visible |
| email | string | sí | Email de login, único |
| password | string | sí | Contraseña (nunca se muestra; solo se envía al crear/cambiar) |
| role | reference → Role | sí | Rol (user/admin) |
| active | boolean | sí | Si la cuenta está activa (inactiva no puede iniciar sesión) |
| createdAt | datetime | sí | Fecha de registro |

### cv-service → Curriculum
Máximo uno por usuario. `photo` es file upload (en UI se renderiza como widget de archivo).
| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| id | id | sí | Identificador único |
| user | reference → User | sí | Dueño (id del User) |
| fullName | string | sí | Nombre completo (título del CV) |
| headline | string | sí | Titular profesional |
| city | string | sí | Ciudad/ubicación |
| photo | string | no | Nombre de archivo de la foto (file upload) |
| profileSummary | string | sí | Texto del "Perfil" |
| skills | array of string | no | Habilidades (texto libre; catálogo Skill sugiere) |
| contactLinks | array of object | no | Lista flexible de enlaces (label + url) |
| createdAt | datetime | sí | Creación |
| updatedAt | datetime | sí | Última actualización |

#### Curriculum.contactLinks (cada entrada)
| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| label | string | sí | Etiqueta (LinkedIn, GitHub, …) |
| url | string | sí | URL o usuario |

### cv-service → Education
| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| id | id | sí | Identificador único |
| curriculum | reference → Curriculum | sí | Curriculum padre |
| title | string | sí | Título del grado/programa |
| institution | string | sí | Institución |
| startDate | date | sí | Inicio |
| endDate | date | no | Fin (vacío = en curso) |

### cv-service → Experience
| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| id | id | sí | Identificador único |
| curriculum | reference → Curriculum | sí | Curriculum padre |
| position | string | sí | Cargo |
| company | string | sí | Empresa |
| location | string | no | Ciudad/país |
| startDate | date | sí | Inicio |
| endDate | date | no | Fin (vacío = actual) |
| description | string | sí | Responsabilidades/logros |

### cv-service → Certificate
| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| id | id | sí | Identificador único |
| curriculum | reference → Curriculum | sí | Curriculum padre |
| name | string | sí | Nombre del certificado |
| date | date | sí | Fecha de obtención |

### cv-service → Skill
| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| id | id | sí | Identificador único |
| name | string | sí | Nombre de la habilidad |
| active | boolean | sí | Si se sugiere |

### cv-service → Template
| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| id | id | sí | Identificador único |
| name | string | sí | Nombre visible del diseño |
| key | string | sí | Clave del componente de diseño |
| description | string | no | Descripción |
| active | boolean | sí | Si está disponible |

## 9. Business Logic (de los microservicios que consume, resumida)

La UI orquesta estos flujos; el detalle y las reglas viven en cada microservicio.

### auth-service
- **Registrar**: crea el User con rol "user"; 400 si el email existe.
- **Login**: valida credenciales y emite un access token corto + un refresh token largo (tiempos
  por evars).
- **Refrescar**: renueva el access (y rota el refresh) con un refresh token válido.
- **Logout**: revoca la sesión (access y refresh) del token.
- **Validar token**: (interno cv-service ↔ auth-service) autoriza cada solicitud protegida.
- **Cambiar/Recuperar contraseña**: cambio con contraseña actual; recuperación por email (Resend)
  con token de un solo uso; ambos revocan sesiones.
- **Cuenta**: editar name/email o desactivar (soft delete; solo dueño o admin). El login rechaza
  cuentas desactivadas.

### cv-service
- **Guardar CV**: máximo un Curriculum por usuario; crea o actualiza; guarda foto; agrega al
  catálogo las habilidades nuevas.
- **Autocompletar/Elegir diseño**: expone Skill activas y Template activos.
- **Administrar catálogos**: escritura solo admin (403 si no).
- **Generar PDF**: valida propiedad, carga el CV y sus entradas, renderiza según el Template y
  devuelve el PDF; 404 si el curriculum no es del usuario.
