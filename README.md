# Sky Fit - Tarea 4

Tienda en línea de ropa fitness para mujer hecha con React, React-Bootstrap y React Router.
En esta tarea conecté el frontend con un backend real hecho con Node.js, Express y MongoDB Atlas.
Ya no hay datos ni login simulados: los usuarios y los productos se guardan en la base de datos
y el frontend los consume con `fetch`.

- Frontend (Netlify): https://tarea-4-sky-fit.netlify.app
- Backend (Render): https://skyfit.onrender.com (API: https://skyfit.onrender.com/api)
- Repositorio: https://github.com/damarisc3/SkyFit (rama `Tarea4`)

## Datos del estudiante

- Nombre: Damaris Luz Marié Cabrera Carino
- Carné: 9490-23-3042
- Curso: Desarrollo Web - 8vo semestre

Hice todo el proyecto yo sola: backend completo (conexión, modelos, controladores, rutas y todos los
endpoints), la conexión del frontend con la API, el panel de administración y el despliegue.

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Frontend | React 19, React-Bootstrap, React Router, Context API + useReducer, fetch |
| Backend | Node.js, Express 5, Mongoose, bcryptjs, cors, dotenv |
| Base de datos | MongoDB Atlas (clúster gratuito M0) |

## Arquitectura de carpetas del backend

Separé el backend por responsabilidades: la ruta solo dice qué URL existe, el controlador tiene la
lógica, el modelo define cómo se guarda el dato en MongoDB y `config` maneja la conexión.

```
backend/
├── server.js                  # Arranca Express, CORS, JSON y monta las rutas
├── seed.js                    # Carga los productos y usuarios iniciales en Atlas
├── .env.example               # Variables necesarias (el .env real NO se sube)
├── SkyFit-API.postman_collection.json
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
    └── errorHandler.js        # 404 de rutas y errores (validación 400, id inválido 400, duplicado 409, 500)
```

Flujo de una petición:

```
React (fetch) ──► routes ──► controller ──► model (Mongoose) ──► MongoDB Atlas
      ▲                                                               │
      └──────────────────── respuesta JSON ◄──────────────────────────┘
```

## Endpoints

URL base local: `http://localhost:5000/api`

| Método | Endpoint | Descripción | Respuestas |
|---|---|---|---|
| POST | `/auth/register` | Registra un usuario nuevo (rol `cliente`) | 201, 400, 409 |
| POST | `/auth/login` | Valida correo y contraseña contra la BD | 200, 400, 401 |
| GET | `/usuarios/:id` | Datos del perfil del usuario | 200, 400, 404 |
| GET | `/productos` | Lista productos. Filtros: `q`, `categoria`, `marca`, `min`, `max` | 200 |
| GET | `/productos/:id` | Detalle de un producto | 200, 400, 404 |
| POST | `/productos` | Crea un producto | 201, 400 |
| PUT | `/productos/:id` | Actualiza un producto | 200, 400, 404 |
| DELETE | `/productos/:id` | Elimina un producto | 200, 400, 404 |

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

El archivo [`backend/SkyFit-API.postman_collection.json`](backend/SkyFit-API.postman_collection.json)
se puede importar en Postman o Thunder Client. Tiene la variable `baseUrl` (cámbiala por
`https://skyfit.onrender.com/api` para probar el backend desplegado). Al hacer login se guarda `userId` y al crear un producto
se guarda `productoId`, así los demás requests funcionan sin copiar ids a mano.

## Cambios en el frontend

- `src/api/client.js`: todas las peticiones a la API con `fetch`. La URL sale de `REACT_APP_API_URL`.
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

- Las contraseñas se guardan cifradas con **bcrypt**, nunca en texto plano.
- La contraseña tiene `select: false` en el modelo y se elimina del JSON, así que nunca sale en las respuestas.
- La cadena de conexión de Atlas está en `backend/.env`, que está en `.gitignore`. En el repositorio
  solo está `.env.example` con valores de ejemplo.
- CORS solo acepta peticiones de los dominios definidos en `CLIENT_URL`.
- El registro no acepta el campo `rol`: toda cuenta nueva es `cliente`.

## Cómo correrlo localmente

1. Backend:
   ```
   cd backend
   npm install
   copy .env.example .env      (y poner la cadena de conexión real de Atlas)
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
| `.env` (raíz) | `REACT_APP_API_URL` | `http://localhost:5000/api` |

## Usuarios de prueba

| Correo | Contraseña | Rol | Membresía |
|---|---|---|---|
| damaris@skyfit.com | skyfit123 | cliente | Premium |
| ana@correo.com | ana12345 | cliente | Estándar |
| admin@skyfit.com | admin123 | admin | Premium |
