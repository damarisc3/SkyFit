# Sky Fit - Tarea 3

Tienda en línea de ropa fitness para mujer hecha con React, React-Bootstrap y React Router.
En esta tarea se agregó el manejo de sesión de usuario (login, logout y perfil) usando estado global.

Sitio publicado: [PENDIENTE - link de Netlify]

Repositorio: https://github.com/damarisc3/SkyFit (rama `Tarea3`)

## Datos del estudiante

- Nombre: Damaris Luz Marié Cabrera Carino
- Carné: 9490-23-3042
- Curso: Desarrollo Web - 8vo semestre

## Arquitectura elegida: Opción A (Context API + useReducer)

Escogí Context + useReducer porque el estado que necesito manejar es pequeño (solo la sesión del usuario)
y no vale la pena instalar Redux para eso. Todo viene incluido en React, no hay que agregar librerías,
y el reducer funciona igual que en Redux (estado + acción = nuevo estado), así que si el proyecto crece
se podría migrar sin problema. Además ningún componente recibe la sesión por props, todos la leen
directamente con los hooks.

Archivo: `src/context/AuthContext.jsx`

Estado inicial:

```js
{ isAuthenticated: false, user: null, error: null, loading: false }
```

Acciones del reducer:

- `LOGIN_START`: pone loading en true mientras se verifica el usuario.
- `LOGIN`: guarda los datos del usuario y pone isAuthenticated en true.
- `LOGIN_ERROR`: guarda el mensaje de error.
- `LOGOUT`: limpia la sesión y regresa isAuthenticated a false.
- `ACTUALIZAR_PERFIL`: modifica datos del usuario sin cerrar sesión.
- `LIMPIAR_ERROR`: borra el error del formulario.

Hooks personalizados:

- `useAuthState()`: devuelve el estado de la sesión.
- `useAuthDispatch()`: devuelve el dispatch.
- `useAuth()`: devuelve el estado y las funciones login, logout y actualizarPerfil.

La sesión también se guarda en localStorage para que no se pierda al recargar la página.

## Usuarios de prueba

| Correo | Contraseña | Membresía |
|---|---|---|
| damaris@skyfit.com | skyfit123 | Premium |
| ana@correo.com | ana12345 | Estándar |
| admin@skyfit.com | admin123 | Administrador |

