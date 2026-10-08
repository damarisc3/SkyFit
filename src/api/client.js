// src/api/client.js
// Cliente HTTP centralizado (fetch) para hablar con la API de Sky Fit.
// La URL base sale de la variable de entorno REACT_APP_API_URL.
const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

// Error con el código HTTP para poder distinguir 401, 404, etc. en la UI
export class ApiError extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.status = status;
  }
}

async function request(ruta, { method = "GET", body } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.", 0);
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ApiError(datos?.mensaje || `Error ${respuesta.status}`, respuesta.status);
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
