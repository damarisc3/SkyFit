// src/context/AuthContext.jsx
// Arquitectura de estado global: Opción A (Context API + useReducer).
// Aquí vive TODO el estado de sesión de Sky Fit. Ningún componente recibe
// la sesión por props: cada uno la consume con los hooks de abajo.
import { createContext, useContext, useReducer, useEffect } from "react";

// ---------- Estado inicial ----------
export const initialState = {
  isAuthenticated: false,
  user: null,        // usuario devuelto por la API: { _id, nombre, correo, rol, membresia, pedidos, createdAt, ... }
  error: null,       // mensaje de error del último intento de login
  loading: false,    // true mientras se espera la respuesta de POST /api/auth/login
};

// ---------- Tipos de acción ----------
export const ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN: "LOGIN",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
  ACTUALIZAR_PERFIL: "ACTUALIZAR_PERFIL",
  LIMPIAR_ERROR: "LIMPIAR_ERROR",
};

// ---------- Reducer ----------
// Recibe el estado actual y una acción, y devuelve el NUEVO estado.
export function authReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN_START:
      return { ...state, loading: true, error: null };

    case ACTIONS.LOGIN:
      // Guarda la información del usuario y marca la sesión como activa
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        error: null,
        loading: false,
      };

    case ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: action.payload,
        loading: false,
      };

    case ACTIONS.LOGOUT:
      // Limpia los datos de sesión y restablece isAuthenticated a false
      return { ...initialState };

    case ACTIONS.ACTUALIZAR_PERFIL:
      // Permite modificar campos del usuario sin cerrar la sesión
      return { ...state, user: { ...state.user, ...action.payload } };

    case ACTIONS.LIMPIAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
}

// ---------- Contextos ----------
// Se separan estado y dispatch en dos contextos: así un componente que solo
// despacha acciones (ej. un botón de logout) no se re-renderiza cuando cambia el estado.
const AuthStateContext = createContext(null);
const AuthDispatchContext = createContext(null);

const STORAGE_KEY = "skyfit_sesion";

// Recupera la sesión guardada para que sobreviva a un refresh de la página
function cargarSesionGuardada() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) return initialState;
    const user = JSON.parse(guardado);
    // Sesiones de la versión simulada (sin _id de MongoDB) ya no son válidas
    if (!user?._id) return initialState;
    return { ...initialState, isAuthenticated: true, user };
  } catch {
    return initialState;
  }
}

// ---------- Proveedor ----------
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, cargarSesionGuardada);

  // Sincroniza el estado global con localStorage cada vez que cambia la sesión
  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state.isAuthenticated, state.user]);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

// ---------- Hooks personalizados ----------
// Devuelve el estado de la sesión: { isAuthenticated, user, error, loading }
export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (context === null) {
    throw new Error("useAuthState debe usarse dentro de <AuthProvider>");
  }
  return context;
}

// Devuelve la función dispatch para lanzar acciones al reducer
export function useAuthDispatch() {
  const context = useContext(AuthDispatchContext);
  if (context === null) {
    throw new Error("useAuthDispatch debe usarse dentro de <AuthProvider>");
  }
  return context;
}

// Hook de conveniencia: expone estado + acciones ya "envueltas"
export function useAuth() {
  const state = useAuthState();
  const dispatch = useAuthDispatch();

  const login = (usuario) => dispatch({ type: ACTIONS.LOGIN, payload: usuario });
  const logout = () => dispatch({ type: ACTIONS.LOGOUT });
  const actualizarPerfil = (cambios) =>
    dispatch({ type: ACTIONS.ACTUALIZAR_PERFIL, payload: cambios });

  return { ...state, dispatch, login, logout, actualizarPerfil };
}
