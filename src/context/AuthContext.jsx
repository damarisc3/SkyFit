// src/context/AuthContext.jsx
// Arquitectura de estado global: Opción A (Context API + useReducer).
// Aquí vive TODO el estado de sesión de Sky Fit. Ningún componente recibe
// la sesión por props: cada uno la consume con los hooks de abajo.
import { createContext, useContext, useReducer, useEffect } from "react";
import { TOKEN_KEY, SESION_KEY, alSesionInvalida, limpiarSesionGuardada } from "../api/client";

// ---------- Estado inicial ----------
export const initialState = {
  isAuthenticated: false,
  user: null,        // usuario devuelto por la API: { _id, nombre, correo, rol, membresia, pedidos, createdAt, ... }
  token: null,       // JWT firmado por el backend (vence a los 5 minutos)
  sesionExpirada: false, // true cuando la sesión se cerró porque el token caducó o dejó de ser válido
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
  LIMPIAR_AVISO_SESION: "LIMPIAR_AVISO_SESION",
};

// ---------- Reducer ----------
// Recibe el estado actual y una acción, y devuelve el NUEVO estado.
export function authReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN_START:
      return { ...state, loading: true, error: null };

    case ACTIONS.LOGIN:
      // Guarda el usuario y su token, y marca la sesión como activa
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        sesionExpirada: false,
        error: null,
        loading: false,
      };

    case ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
        loading: false,
      };

    case ACTIONS.LOGOUT:
      // Limpia los datos de sesión y restablece isAuthenticated a false.
      // Si el cierre fue por token expirado/inválido se marca para avisar en el login.
      return { ...initialState, sesionExpirada: action.payload?.expirada === true };

    case ACTIONS.ACTUALIZAR_PERFIL:
      // Permite modificar campos del usuario sin cerrar la sesión
      return { ...state, user: { ...state.user, ...action.payload } };

    case ACTIONS.LIMPIAR_ERROR:
      return { ...state, error: null };

    case ACTIONS.LIMPIAR_AVISO_SESION:
      return { ...state, sesionExpirada: false };

    default:
      return state;
  }
}

// ---------- Contextos ----------
// Se separan estado y dispatch en dos contextos: así un componente que solo
// despacha acciones (ej. un botón de logout) no se re-renderiza cuando cambia el estado.
const AuthStateContext = createContext(null);
const AuthDispatchContext = createContext(null);

// Lee la fecha de expiración (exp, en segundos) del payload del JWT.
// Solo se decodifica para programar el cierre: la firma la valida siempre el backend.
function expiracionToken(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)).exp * 1000;
  } catch {
    return 0;
  }
}

// Recupera la sesión guardada para que sobreviva a un refresh de la página
function cargarSesionGuardada() {
  try {
    const guardado = localStorage.getItem(SESION_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    if (!guardado || !token) return initialState;
    const user = JSON.parse(guardado);
    // Sesiones sin _id de MongoDB o con el token ya vencido no son válidas
    if (!user?._id) return initialState;
    if (expiracionToken(token) <= Date.now()) {
      limpiarSesionGuardada();
      return { ...initialState, sesionExpirada: true };
    }
    return { ...initialState, isAuthenticated: true, user, token };
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
      localStorage.setItem(SESION_KEY, JSON.stringify(state.user));
      localStorage.setItem(TOKEN_KEY, state.token);
    } else {
      limpiarSesionGuardada();
    }
  }, [state.isAuthenticated, state.user, state.token]);

  // El interceptor del cliente HTTP llama a esta función cuando la API responde 401
  useEffect(() => {
    alSesionInvalida(() => dispatch({ type: ACTIONS.LOGOUT, payload: { expirada: true } }));
    return () => alSesionInvalida(null);
  }, []);

  // Además se programa el cierre justo cuando vence el token (aunque no haya peticiones)
  useEffect(() => {
    if (!state.token) return;
    const restante = expiracionToken(state.token) - Date.now();
    const timer = setTimeout(
      () => dispatch({ type: ACTIONS.LOGOUT, payload: { expirada: true } }),
      Math.max(restante, 0)
    );
    return () => clearTimeout(timer);
  }, [state.token]);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

// ---------- Hooks personalizados ----------
// Devuelve el estado de la sesión: { isAuthenticated, user, token, sesionExpirada, error, loading }
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

  const login = (usuario, token) =>
    dispatch({ type: ACTIONS.LOGIN, payload: { user: usuario, token } });
  const logout = () => dispatch({ type: ACTIONS.LOGOUT });
  const actualizarPerfil = (cambios) =>
    dispatch({ type: ACTIONS.ACTUALIZAR_PERFIL, payload: cambios });

  return { ...state, dispatch, login, logout, actualizarPerfil };
}
