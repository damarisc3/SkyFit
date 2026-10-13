// src/api/client.js
// Cliente HTTP centralizado (fetch) para hablar con la API de Sky Fit.
// La URL base sale de la variable de entorno REACT_APP_API_URL.
// - Adjunta automáticamente "Authorization: Bearer <token>" a todas las peticiones.
// - Funciona como interceptor de respuestas: ante un 401 de una petición autenticada
//   limpia la sesión guardada y avisa a la app para que haga LOGOUT y redirija a /login.
const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

// ---------- Token (persistido en localStorage) ----------
export const TOKEN_KEY = "skyfit_token";
export const SESION_KEY = "skyfit_sesion";

export const obtenerToken = () => localStorage.getItem(TOKEN_KEY);

export function limpiarSesionGuardada() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESION_KEY);
}

// AuthContext registra aquí la función que dispara el LOGOUT global
let manejadorSesionInvalida = null;
export function alSesionInvalida(fn) {
  manejadorSesionInvalida = fn;
}

// Error con el código HTTP para poder distinguir 401, 404, etc. en la UI
export class ApiError extends Error {
  constructor(mensaje, status, codigo) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo; // ej. "token_expired"
  }
}

async function request(ruta, { method = "GET", body } = {}) {
  const token = obtenerToken();
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.", 0);
  }

  const datos = await respuesta.json().catch(() => null);

  // Interceptor: la petición iba con token y el servidor lo rechazó (expirado o inválido)
  if (respuesta.status === 401 && token) {
    limpiarSesionGuardada();
    manejadorSesionInvalida?.(datos?.error || "token_invalid");
  }

  if (!respuesta.ok) {
    throw new ApiError(
      datos?.message || datos?.mensaje || `Error ${respuesta.status}`,
      respuesta.status,
      datos?.error
    );
  }
  return datos;
}

// ---------- Autenticación ----------
export const loginApi = (correo, password) =>
  request("/auth/login", { method: "POST", body: { correo, password } });

export const registerApi = (datos) => request("/auth/register", { method: "POST", body: datos });

// ---------- Usuarios ----------
export const obtenerUsuario = (id) => request(`/usuarios/${id}`);

// ---------- Productos ----------
export const listarProductos = (filtros = {}) => {
  const params = new URLSearchParams(
    Object.entries(filtros).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return request(`/productos${params ? `?${params}` : ""}`);
};

export const obtenerProducto = (id) => request(`/productos/${id}`);

export const crearProducto = (datos) => request("/productos", { method: "POST", body: datos });

export const actualizarProducto = (id, datos) =>
  request(`/productos/${id}`, { method: "PUT", body: datos });

export const eliminarProducto = (id) => request(`/productos/${id}`, { method: "DELETE" });
