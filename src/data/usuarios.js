// src/data/usuarios.js
// "Base de datos" simulada de clientas. La contraseña está en texto plano
// únicamente porque la autenticación es simulada (no hay backend).
const usuarios = [
  {
    id: 1,
    nombre: "Damaris Cabrera",
    correo: "damaris@skyfit.com",
    password: "skyfit123",
    rol: "Premium",
    miembroDesde: "2025-03-14",
    pedidos: [
      { id: "SF-1041", fecha: "2026-08-02", productos: "Legging Align Azul Cielo", total: 450.0, estado: "Entregado" },
      { id: "SF-1077", fecha: "2026-08-21", productos: "Conjunto Seamless Celeste", total: 520.0, estado: "En camino" },
      { id: "SF-1102", fecha: "2026-09-05", productos: "Sports Bra Ribbed Blanco, Top Halter Ribbed Blanco", total: 475.0, estado: "Procesando" },
    ],
  },
  {
    id: 2,
    nombre: "Ana Gómez",
    correo: "ana@correo.com",
    password: "ana12345",
    rol: "Estándar",
    miembroDesde: "2026-01-20",
    pedidos: [
      { id: "SF-1090", fecha: "2026-08-28", productos: "Short Biker Blue", total: 220.0, estado: "Entregado" },
    ],
  },
  {
    id: 3,
    nombre: "Administradora Sky Fit",
    correo: "admin@skyfit.com",
    password: "admin123",
    rol: "Administrador",
    miembroDesde: "2024-11-01",
    pedidos: [],
  },
];

// Simula la consulta a un servidor: devuelve una promesa que se resuelve
// (o rechaza) después de un pequeño retraso.
export function autenticar(correo, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const usuario = usuarios.find(
        (u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.password === password
      );
      if (!usuario) {
        reject(new Error("Correo o contraseña incorrectos."));
        return;
      }
      // Nunca se guarda la contraseña en el estado global
      const { password: _omitida, ...datos } = usuario;
      resolve({ ...datos, fechaAcceso: new Date().toISOString() });
    }, 600);
  });
}

export default usuarios;
