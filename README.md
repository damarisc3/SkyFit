# Sky Fit — Tienda en línea (Tarea 3: Estado global y autenticación)

Tienda en línea de ropa fitness femenina desarrollada con **React + React-Bootstrap + React Router**.
Esta entrega parte de la Tarea 2 y agrega una **arquitectura de estado global** para manejar la sesión
de la usuaria (Login / Logout / Perfil) de forma transversal en toda la aplicación.

**Sitio publicado:** [PENDIENTE — agregar enlace de Netlify]

**Repositorio:** https://github.com/damarisc3/SkyFit — rama `Tarea3`

## Integrantes

| Nombre completo | Carné | Secciones y componentes desarrollados |
|---|---|---|
| Damaris Luz Marié Cabrera Carino | 9490-23-3042 | Todo el proyecto (trabajo individual): `AuthContext`, `Login`, `Perfil`, `RutaProtegida`, adaptación de `NavigationBar`, datos simulados, estilos, README y despliegue. |

**Curso:** Desarrollo Web — 8vo semestre, Ingeniería en Sistemas, Universidad Mariano Gálvez de Guatemala.

## Arquitectura de estado seleccionada: Opción A — Context API + `useReducer`

### Justificación

Elegí la combinación nativa `useContext` + `useReducer` en lugar de Redux Toolkit por estas razones:

1. **Tamaño del estado.** El estado global de Sky Fit es pequeño (sesión y datos de la usuaria). Redux Toolkit
   está pensado para aplicaciones con muchos *slices* y lógica asíncrona compleja; aquí sería más
   infraestructura que problema.
2. **Cero dependencias extra.** Context y `useReducer` vienen incluidos en React. No hay que instalar
   `@reduxjs/toolkit` ni `react-redux`, lo que reduce el tamaño del bundle y simplifica el mantenimiento.
3. **Mismo patrón que Redux, sin el boilerplate.** El reducer sigue el modelo `(estado, acción) => nuevoEstado`,
   con acciones tipadas y estado inmutable. Si el proyecto creciera, migrar a Redux Toolkit sería directo
   porque la estructura ya es la misma.
4. **Sin *prop drilling*.** Ningún componente recibe la sesión por props: `NavigationBar`, `Login`, `Perfil` y
   `RutaProtegida` la consumen directamente con hooks personalizados.

### Cómo está implementada

Archivo: `src/context/AuthContext.jsx`

- **`initialState`**: `{ isAuthenticated: false, user: null, error: null, loading: false }`
- **`authReducer`** — gestiona 6 acciones:

  | Acción | Efecto |
  |---|---|
  | `LOGIN_START` | Activa `loading` y limpia errores mientras se verifica la credencial. |
  | `LOGIN` | Guarda la información de la usuaria en `user` y pone `isAuthenticated = true`. |
  | `LOGIN_ERROR` | Guarda el mensaje de error y deja la sesión sin autenticar. |
  | `LOGOUT` | Limpia los datos de sesión y restablece `isAuthenticated = false`. |
  | `ACTUALIZAR_PERFIL` | Modifica campos del usuario sin cerrar sesión. |
  | `LIMPIAR_ERROR` | Borra el error mostrado en el formulario. |

- **`AuthProvider`**: encapsula el `useReducer` y provee dos contextos separados (estado y `dispatch`).
  Además sincroniza la sesión con `localStorage` para que sobreviva a un refresh.
- **Hooks personalizados**:
  - `useAuthState()` → devuelve el estado de sesión.
  - `useAuthDispatch()` → devuelve la función `dispatch`.
  - `useAuth()` → atajo que devuelve estado + acciones ya envueltas (`login`, `logout`, `actualizarPerfil`).

## Componentes

| Archivo | Descripción |
|---|---|
| `src/context/AuthContext.jsx` | Proveedor global de autenticación: estado inicial, reducer, `AuthProvider` y hooks personalizados. |
| `src/data/usuarios.js` | "Base de datos" simulada de clientas (con membresía y pedidos) y función `autenticar()` que simula la consulta a un servidor con una promesa. |
| `src/pages/Login.jsx` | Formulario de inicio de sesión con `Form`, `Card`, `Alert` y `Spinner` de React-Bootstrap. Valida correo (formato) y contraseña (mínimo 6 caracteres); con credenciales válidas despacha `LOGIN` con datos estructurados (nombre, correo, rol, fecha de acceso). |
| `src/pages/Perfil.jsx` | Dashboard de la usuaria autenticada. Lee todo del estado global y muestra nombre, correo, tipo de membresía (`Badge`), fecha de ingreso y último acceso (`ListGroup`), e historial de pedidos simulado (`Table`). Incluye botón de cerrar sesión. |
| `src/components/RutaProtegida.jsx` | Protege la ruta `/perfil`: si no hay sesión redirige a `/login`. |
| `src/components/NavigationBar.jsx` | Barra de navegación que reacciona en tiempo real a la sesión: sin sesión muestra "Iniciar sesión"; con sesión oculta ese botón y muestra el nombre de la usuaria, un menú con acceso al perfil y "Cerrar sesión". |
| `src/components/Footer.jsx` | Pie de página con datos de la estudiante. |
| `src/pages/Home.jsx` | Inicio con `Carousel` y productos destacados en `Card`. |
| `src/pages/Catalogo.jsx` | Catálogo por categorías con `Accordion`, `Table` y `Badge`. |
| `src/pages/ProductoDetalle.jsx` | Detalle de producto con `ListGroup` y `Modal` de garantía. |
| `src/pages/Carrito.jsx` | Carrito simulado con `Table` y `ListGroup`. |
| `src/pages/Registro.jsx` | Formulario de registro. |
| `src/pages/Contacto.jsx` | Formulario de contacto. |
| `src/App.js` | Envuelve la aplicación en `<AuthProvider>` y define las rutas, incluidas `/login` y `/perfil`. |

## Cuentas de prueba (autenticación simulada)

| Correo | Contraseña | Membresía |
|---|---|---|
| damaris@skyfit.com | skyfit123 | Premium |
| ana@correo.com | ana12345 | Estándar |
| admin@skyfit.com | admin123 | Administrador |

## Cómo ejecutar

```bash
npm install
npm start        # http://localhost:3000
npm run build    # versión de producción en /build
```

## Despliegue en Netlify

- Comando de build: `npm run build`
- Directorio de publicación: `build`
- `public/_redirects` contiene `/* /index.html 200` para que React Router funcione al recargar cualquier ruta.

## Tecnologías

React 19, React-Bootstrap 2, Bootstrap 5, React Router 7, Create React App.
