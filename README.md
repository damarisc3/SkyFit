# Sky Fit - Tarea 5

Sky Fit es una tienda en línea de ropa deportiva para mujer. El frontend está hecho con React y
React-Bootstrap y el backend con Node.js, Express y MongoDB Atlas.

En esta tarea agregué autenticación con JSON Web Tokens (JWT). Cuando la usuaria inicia sesión, el
backend le devuelve un token que dura 5 minutos. Ese token se manda en cada petición a la API y,
cuando vence, la página le avisa a la usuaria y la regresa al login.

## Links

- Frontend (Netlify): https://sky-fit-t5.netlify.app
- Backend (Render): https://skyfit-t5.onrender.com (las rutas de la API empiezan con `/api`, por ejemplo `/api/auth/login`)
- Repositorio: https://github.com/damarisc3/SkyFit (rama `Tarea5`)

## Integrantes

| Nombre completo | Carné | Responsabilidades y componentes |
|---|---|---|
| Damaris Luz Marié Cabrera Carino | 9490-23-3042 | Hice la tarea completa de forma individual. En el backend: generación del token en el login, el middleware `auth.js` y la protección de las rutas de productos y usuarios. En el frontend: el cliente HTTP con el token y el interceptor (`client.js`), el manejo de la sesión en `AuthContext.jsx`, la redirección (`ManejadorSesion.jsx`) y el aviso en el Login. También hice la colección de Postman y el despliegue en Render y Netlify. |

## Cómo configuré la expiración en el backend

Instalé la librería `jsonwebtoken` y agregué dos variables al archivo `backend/.env`:

```
JWT_SECRET=una_clave_larga_y_secreta
JWT_EXPIRES_IN=5m
```

El `.env` no se sube a GitHub (está en el `.gitignore`), solo subí un `.env.example` de muestra.
En Render puse estas mismas variables en la sección Environment.

En el login, después de revisar que el correo y la contraseña son correctos, se crea el token con
`jwt.sign`. Dentro del token guardo el id, el correo y el rol de la usuaria, y con `expiresIn`
le indico que dure 5 minutos:

```js
jwt.sign(
  { id: usuario._id, email: usuario.correo, role: usuario.rol },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
```

Para proteger las rutas hice un middleware en `backend/middleware/auth.js` llamado `protegerRuta`.
Este lee el token de la cabecera `Authorization: Bearer <token>` y lo revisa con `jwt.verify`:

- Si no viene el token, responde `401`.
- Si el token ya pasó los 5 minutos, `jwt.verify` lanza un `TokenExpiredError`. Lo atrapo y
  respondo `401` con este JSON:

```json
{
  "error": "token_expired",
  "message": "La sesión ha expirado o ya no es válida. Por favor, inicie sesión nuevamente."
}
```

- Si el token es válido, deja continuar la petición.

También hice `soloAdmin`, que responde `403` si el usuario no es administrador.

Rutas protegidas:

| Método | Ruta | Quién puede usarla |
|---|---|---|
| POST | `/api/auth/register` | Público |
| POST | `/api/auth/login` | Público |
| GET | `/api/usuarios/:id` | Usuaria con sesión (solo su propio perfil) |
| GET | `/api/productos` | Usuaria con sesión |
| GET | `/api/productos/:id` | Usuaria con sesión |
| POST | `/api/productos` | Solo admin |
| PUT | `/api/productos/:id` | Solo admin |
| DELETE | `/api/productos/:id` | Solo admin |

## Cómo el frontend maneja la sesión expirada

1. Al iniciar sesión guardo el token y los datos de la usuaria en `localStorage` y en el estado
   global (Context API con `useReducer`, en `src/context/AuthContext.jsx`).
2. Todas las peticiones pasan por una sola función en `src/api/client.js`. Esa función le agrega
   automáticamente la cabecera `Authorization: Bearer <token>`.
3. En esa misma función reviso la respuesta. Si la API responde `401`, significa que el token
   venció o no es válido, entonces:
   - borro el token y los datos de la usuaria del `localStorage`,
   - ejecuto la acción `LOGOUT` del estado global.
4. El componente `src/components/ManejadorSesion.jsx` está pendiente de ese cierre de sesión y usa
   `useNavigate` para mandar a la usuaria a `/login`.
5. En el Login se muestra un `Alert` de React-Bootstrap que dice "Su sesión ya no es válida o ha
   caducado. Por favor, inicie sesión nuevamente."

Además, en el `AuthContext` puse un temporizador que cierra la sesión justo cuando se cumplen los
5 minutos, para que salga el aviso aunque la usuaria no haga ninguna petición.

En el frontend también protegí las páginas de Catálogo, Detalle, Carrito y Perfil. Si alguien entra
sin sesión, lo manda al login.

## Pruebas en Postman

El archivo `backend/SkyFit-API-Tarea5.postman_collection.json` se puede importar en Postman.
Para probar el backend en línea hay que cambiar la variable `baseUrl` a
`https://skyfit-t5.onrender.com/api`.

En la carpeta "JWT - Tarea 5" están las pruebas que pide la tarea:

1. Login: devuelve el token y lo guarda en la variable `token`.
2. Perfil con el token válido: responde `200`.
3. Perfil con el token vencido: se ejecuta después de esperar 5 minutos y responde `401` con
   `token_expired`.

También agregué pruebas sin token (`401`) y de una clienta intentando crear un producto (`403`).

## Cómo correrlo localmente

Backend:

```
cd backend
npm install
npm run dev
```

Frontend (en otra terminal, desde la carpeta principal):

```
npm install
npm start
```

Antes hay que crear el archivo `backend/.env` copiando `backend/.env.example` y poner la conexión de
MongoDB Atlas y un `JWT_SECRET`. En el `.env` de la carpeta principal va
`REACT_APP_API_URL=http://localhost:5000/api`.

## Usuarios de prueba

| Correo | Contraseña | Rol |
|---|---|---|
| damaris@skyfit.com | skyfit123 | cliente |
| ana@correo.com | ana12345 | cliente |
| admin@skyfit.com | admin123 | admin |
