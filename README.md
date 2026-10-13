# Sky Fit - Tarea 5

Tienda en línea de ropa fitness para mujer hecha con React, React-Bootstrap y React Router, con un
backend en Node.js, Express y MongoDB Atlas.

En esta tarea agregué seguridad **sin estado (stateless)** con **JSON Web Tokens**: el login devuelve
un token firmado que vence a los **5 minutos**, las rutas privadas de la API exigen
`Authorization: Bearer <token>` y el frontend detecta cuando la sesión caducó, avisa a la usuaria y
la redirige al login.

- Frontend (Netlify): https://tarea-4-sky-fit.netlify.app
- Backend (Render): https://skyfit.onrender.com (API: https://skyfit.onrender.com/api)
- Repositorio: https://github.com/damarisc3/SkyFit (rama `Tarea5`)

## Datos del estudiante

- Nombre: Damaris Luz Marié Cabrera Carino
- Carné: 9490-23-3042
- Curso: Desarrollo Web - 8vo semestre

| Nombre completo | Carné | Responsabilidades | Componentes desarrollados |
|---|---|---|---|
| Damaris Luz Marié Cabrera Carino | 9490-23-3042 | Desarrollo completo (trabajo individual): seguridad del backend con JWT, protección de endpoints, cliente HTTP con interceptor, manejo de sesión expirada en React, pruebas en Postman, documentación y despliegue | **Backend:** `middleware/auth.js` (`generarToken`, `protegerRuta`, `soloAdmin`), login/registro con token en `authController.js`, CRUD de productos protegido en `productoRoutes.js` y perfil protegido en `usuarioRoutes.js`. **Frontend:** `api/client.js` (Bearer automático + interceptor 401), rutas protegidas en `App.js` y `RutaProtegida.jsx`, `context/AuthContext.jsx` (token en estado global, LOGOUT por expiración, temporizador), `components/ManejadorSesion.jsx` (redirección con `useNavigate`), aviso en `pages/Login.jsx`. **Pruebas:** `SkyFit-API-Tarea5.postman_collection.json` |

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Frontend | React 19, React-Bootstrap, React Router, Context API + useReducer, fetch |
| Backend | Node.js, Express 5, Mongoose, bcryptjs, jsonwebtoken, cors, dotenv |
| Base de datos | MongoDB Atlas (clúster gratuito M0) |

## Arquitectura de carpetas del backend

Separé el backend por responsabilidades: la ruta solo dice qué URL existe, el controlador tiene la
lógica, el modelo define cómo se guarda el dato en MongoDB y `config` maneja la conexión.

```
backend/
├── server.js                  # Arranca Express, CORS, JSON y monta las rutas
├── seed.js                    # Carga los productos y usuarios iniciales en Atlas
├── .env.example               # Variables necesarias (el .env real NO se sube)
├── SkyFit-API-Tarea5.postman_collection.json
├── config/
│   └── db.js                  # Conexión a MongoDB Atlas con Mongoose y manejo de errores
├── models/
│   ├── User.js                # nombre, correo, password (bcrypt), rol, membresía, pedidos, timestamps
│   └── Producto.js            # nombre, marca, categoría, precio, tallas, color, stock, imagen, timestamps
├── controllers/
│   ├── authController.js      # register y login
│   ├── usuarioController.js   # perfil por id
│   └── productoController.js  # CRUD de productos con filtros
├── routes/
│   ├── authRoutes.js          # /api/auth
│   ├── usuarioRoutes.js       # /api/usuarios
│   └── productoRoutes.js      # /api/productos
└── middleware/
    ├── auth.js                # JWT: generarToken, protegerRuta (401) y soloAdmin (403)
    └── errorHandler.js        # 404 de rutas y errores (validación 400, id inválido 400, duplicado 409, 500)
```

Flujo de una petición protegida:

```
React (fetch + Bearer) ──► routes ──► protegerRuta (JWT) ──► controller ──► model ──► MongoDB Atlas
        ▲                                   │ 401 si falta / expiró / es inválido          │
        └──────────────────────── respuesta JSON ◄──────────────────────────────────────────┘
```

## Seguridad con JWT (Tarea 5)

### Cómo se configuró la expiración en el backend

1. **Variables de entorno** (`backend/.env`, que no se sube a GitHub):
   ```
   JWT_SECRET=<clave aleatoria de 96 caracteres>
   JWT_EXPIRES_IN=5m
   ```
   En Render se configuran las mismas dos variables en *Environment*. Si falta `JWT_SECRET`, el
   servidor no arranca (`server.js` lo valida al iniciar).

2. **Generación del token** (`middleware/auth.js` → `generarToken`): cuando `POST /api/auth/login`
   valida el correo y la contraseña con bcrypt, firma el token con la librería `jsonwebtoken`:
   ```js
   jwt.sign(
     { id: usuario._id, email: usuario.correo, role: usuario.rol },  // payload
     process.env.JWT_SECRET,
     { expiresIn: process.env.JWT_EXPIRES_IN }                        // "5m"
   );
   ```
   `expiresIn` agrega al token el campo `exp` (fecha de vencimiento), que queda exactamente
   300 segundos después de `iat` (fecha de emisión). Como el token va firmado, nadie puede cambiar
   `exp` sin invalidar la firma.

3. **Middleware `protegerRuta`**: lee la cabecera `Authorization: Bearer <token>` y la verifica con
   `jwt.verify(token, JWT_SECRET)`, que comprueba la firma y la fecha `exp`:
   - Sin cabecera o sin token → `401` con `error: "token_missing"`.
   - Token vencido (`TokenExpiredError`) → `401` con:
     ```json
     {
       "error": "token_expired",
       "message": "La sesión ha expirado o ya no es válida. Por favor, inicie sesión nuevamente."
     }
     ```
   - Firma alterada o token mal formado → `401` con `error: "token_invalid"`.
   - Token válido → guarda el payload en `req.usuario` y deja pasar la petición.

4. **`soloAdmin`**: se usa después de `protegerRuta` y responde `403` si el `role` del token no es
   `admin`.

El servidor no guarda sesiones: toda la información necesaria viaja dentro del token.

### Cómo el frontend intercepta la expiración y redirige

1. **Persistencia y estado global** (`src/context/AuthContext.jsx`, Context API + `useReducer`):
   al iniciar sesión se despacha `LOGIN` con `{ user, token }`. El token se guarda en el estado
   global y en `localStorage` (`skyfit_token`), así la sesión sobrevive a un refresh. Al recargar,
   si el token guardado ya venció, no se restaura la sesión.

2. **Cliente HTTP centralizado** (`src/api/client.js`): la función `request()` (envoltorio de
   `fetch`) por la que pasan **todas** las peticiones agrega automáticamente
   `Authorization: Bearer <token>`.

3. **Interceptor de respuestas**: en la misma función `request()`, si la API responde `401` a una
   petición que llevaba token:
   1. Elimina el token y los datos de la usuaria de `localStorage`.
   2. Llama al manejador que registró `AuthContext`, que despacha `LOGOUT` con
      `{ expirada: true }`. El reducer limpia la sesión y marca `sesionExpirada: true`.

4. **Redirección automática** (`src/components/ManejadorSesion.jsx`): este componente vive dentro
   de `<BrowserRouter>`, observa `sesionExpirada` y, cuando se vuelve `true`, ejecuta
   `navigate("/login", { replace: true })` con `useNavigate`.

5. **Mensaje a la usuaria** (`src/pages/Login.jsx`): si `sesionExpirada` es `true` se muestra un
   `Alert` de React-Bootstrap: *"Su sesión ya no es válida o ha caducado. Por favor, inicie sesión
   nuevamente."*

6. **Temporizador (extra)**: `AuthContext` lee el campo `exp` del token y programa un
   `setTimeout` que despacha el mismo `LOGOUT` justo cuando vence. Así la usuaria sale aunque no
   haga ninguna petición. Igual, quien decide si el token es válido siempre es el backend.

```
API responde 401 ──► client.js limpia localStorage ──► dispatch(LOGOUT expirada)
                                                              │
                     Login muestra Alert ◄── navigate("/login") ◄── ManejadorSesion
```

## Endpoints

URL base local: `http://localhost:5000/api`

| Método | Endpoint | Acceso | Descripción | Respuestas |
|---|---|---|---|---|
| POST | `/auth/register` | Público | Registra un usuario nuevo (rol `cliente`) y devuelve token | 201, 400, 409 |
| POST | `/auth/login` | Público | Valida credenciales y devuelve el JWT (5 min) | 200, 400, 401 |
| GET | `/usuarios/:id` | 🔒 Token (solo su propio perfil o admin) | Datos del perfil del usuario | 200, 400, 401, 403, 404 |
| GET | `/productos` | 🔒 Token | Lista productos. Filtros: `q`, `categoria`, `marca`, `min`, `max` | 200, 401 |
| GET | `/productos/:id` | 🔒 Token | Detalle de un producto | 200, 400, 401, 404 |
| POST | `/productos` | 🔒 Token + admin | Crea un producto | 201, 400, 401, 403 |
| PUT | `/productos/:id` | 🔒 Token + admin | Actualiza un producto | 200, 400, 401, 403, 404 |
| DELETE | `/productos/:id` | 🔒 Token + admin | Elimina un producto | 200, 400, 401, 403, 404 |

Todo el CRUD de **Productos** (la entidad de negocio) es privado: en `productoRoutes.js` se aplica
`router.use(protegerRuta)`, así que cualquier consulta o cambio necesita la cabecera
`Authorization: Bearer <token>`. Las consultas `GET` las puede hacer cualquier usuaria autenticada.
Crear, editar y eliminar además requieren rol `admin`. Solo el registro y el login son públicos.

### Ejemplos de payload

`POST /api/auth/register`
```json
{
  "nombre": "María López",
  "correo": "maria@correo.com",
  "password": "maria123",
  "telefono": "5555-1234",
  "direccion": "Zona 10, Ciudad de Guatemala"
}
```

`POST /api/auth/login`
```json
{ "correo": "damaris@skyfit.com", "password": "skyfit123" }
```

Respuesta correcta (la contraseña nunca se devuelve):
```json
{
  "mensaje": "Inicio de sesión exitoso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "_id": "6ac71a71e777b8e189d32d33",
    "nombre": "Damaris Cabrera",
    "correo": "damaris@skyfit.com",
    "rol": "cliente",
    "membresia": "Premium",
    "pedidos": [ ... ],
    "createdAt": "2026-10-08T04:22:09.083Z",
    "updatedAt": "2026-10-08T04:22:09.083Z"
  }
}
```

Respuesta con credenciales inválidas (`401`):
```json
{ "mensaje": "Correo o contraseña incorrectos." }
```

`GET /api/productos?q=gymshark&categoria=Tops y Sports Bra&min=100&max=300`

`POST /api/productos`
```json
{
  "nombre": "Legging Flare Negro",
  "marca": "Alo Yoga",
  "categoria": "Leggings",
  "precio": 490,
  "tallas": "XS, S, M, L",
  "color": "Negro",
  "stock": 7,
  "imagen": "https://placehold.co/600x600?text=Legging+Flare",
  "descripcion": "Legging acampanado de tiro alto."
}
```

`PUT /api/productos/:id`
```json
{ "precio": 450, "stock": 12 }
```

### Colección de pruebas

El archivo [`backend/SkyFit-API-Tarea5.postman_collection.json`](backend/SkyFit-API-Tarea5.postman_collection.json)
se puede importar en Postman o Thunder Client. Tiene la variable `baseUrl` (cámbiala por
`https://skyfit.onrender.com/api` para probar el backend desplegado).

La carpeta **JWT - Tarea 5** tiene las pruebas pedidas:

1. **Login (obtiene el token)**: guarda el token en `{{token}}` y comprueba que dure 300 segundos.
2. **Perfil con Bearer válido** → `200`.
3. **Perfil con token expirado**: se ejecuta después de esperar 5 minutos → `401` con
   `error: "token_expired"`. Cada request incluye un ejemplo guardado con la respuesta obtenida.
4. **Listar productos sin token** → `401`.
5. **Crear producto sin token** → `401`.
6. **Cliente intenta crear producto** → `403`.

La colección usa `Bearer {{token}}` por defecto. Solo registro y login usan *No Auth*. Crear, editar
o eliminar productos usa `{{adminToken}}`, que se guarda al ejecutar *Login admin*.

## Cambios en el frontend

- `src/api/client.js`: todas las peticiones a la API con `fetch`. La URL sale de `REACT_APP_API_URL`.
  Desde la Tarea 5 adjunta el token y tiene el interceptor de `401` (ver la sección de JWT).
- **Login**: envía las credenciales a `POST /api/auth/login`. Si la respuesta es correcta se dispara la
  acción global `LOGIN` con el usuario que devolvió el servidor. Si es `401` se muestra un `Alert`.
- **Registro**: ahora sí crea la cuenta en MongoDB y entra directo al perfil.
- **Catálogo, Detalle, Inicio y Carrito**: ya no usan arreglos fijos, piden los productos con `GET`.
  Muestran un `Spinner` mientras cargan y un `Alert` con botón de reintentar si falla. El catálogo
  tiene búsqueda y filtro por categoría (query params).
- **Perfil**: al entrar consulta `GET /api/usuarios/:id`, actualiza el estado global con lo que hay en
  la BD y lo muestra con `Card`, `Badge`, `ListGroup` y `Table` (rol, membresía, fecha de registro,
  última actualización, teléfono, dirección, ID de MongoDB e historial de pedidos).
- **Administrar productos** (`/admin/productos`, solo rol `admin`): tabla con todos los productos,
  `Modal` con formulario para crear y editar, y botón para eliminar con confirmación.

El estado global sigue siendo **Context API + useReducer** (`src/context/AuthContext.jsx`), igual que
en la Tarea 3. Las acciones son las mismas (`LOGIN_START`, `LOGIN`, `LOGIN_ERROR`, `LOGOUT`,
`ACTUALIZAR_PERFIL`, `LIMPIAR_ERROR`), solo que ahora el payload viene del servidor.

## Seguridad

- Autenticación sin estado con **JWT** firmado con `JWT_SECRET` (HS256) y vigencia de 5 minutos.
- Todas las rutas de productos y de usuarios usan el middleware `protegerRuta`. Las de administración
  usan además `soloAdmin`.
- En el frontend, Catálogo, Detalle de producto, Carrito y Perfil son rutas protegidas
  (`RutaProtegida`). Sin sesión se redirige a `/login` y, al iniciar sesión, se vuelve a la página que
  se quería abrir. En Inicio, las visitantes sin sesión ven una invitación a iniciar sesión.
- Una usuaria solo puede consultar su propio perfil (`403` si pide el de otra persona).
- Las contraseñas se guardan cifradas con **bcrypt**, nunca en texto plano.
- La contraseña tiene `select: false` en el modelo y se elimina del JSON, así que nunca sale en las respuestas.
- La cadena de conexión de Atlas y el `JWT_SECRET` están en `backend/.env`, que está en `.gitignore`.
  En el repositorio solo está `.env.example` con valores de ejemplo.
- CORS solo acepta peticiones de los dominios definidos en `CLIENT_URL`.
- El registro no acepta el campo `rol`: toda cuenta nueva es `cliente`.

## Cómo correrlo localmente

1. Backend:
   ```
   cd backend
   npm install
   copy .env.example .env      (poner la cadena de conexión de Atlas y un JWT_SECRET propio)
   npm run seed                (carga los datos iniciales, solo la primera vez)
   npm run dev
   ```
2. Frontend (en otra terminal, desde la raíz):
   ```
   npm install
   npm start
   ```

Variables de entorno:

| Archivo | Variable | Ejemplo |
|---|---|---|
| `backend/.env` | `PORT` | `5000` |
| `backend/.env` | `MONGO_URI` | `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/skyfit` |
| `backend/.env` | `CLIENT_URL` | `http://localhost:3000,https://mi-sitio.netlify.app` |
| `backend/.env` | `JWT_SECRET` | clave larga y aleatoria (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `backend/.env` | `JWT_EXPIRES_IN` | `5m` |
| `.env` (raíz) | `REACT_APP_API_URL` | `http://localhost:5000/api` |

## Usuarios de prueba

| Correo | Contraseña | Rol | Membresía |
|---|---|---|---|
| damaris@skyfit.com | skyfit123 | cliente | Premium |
| ana@correo.com | ana12345 | cliente | Estándar |
| admin@skyfit.com | admin123 | admin | Premium |
