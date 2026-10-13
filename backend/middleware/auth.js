// middleware/auth.js
// Capa de autorización con JSON Web Tokens (sin estado: el servidor no guarda sesiones).
const jwt = require("jsonwebtoken");

// Firma un token con la identidad de la usuaria. Vence según JWT_EXPIRES_IN (5 minutos).
function generarToken(usuario) {
  return jwt.sign(
    { id: usuario._id.toString(), email: usuario.correo, role: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "5m" }
  );
}

// Lee "Authorization: Bearer <token>", verifica la firma y deja el payload en req.usuario
function protegerRuta(req, res, next) {
  const cabecera = req.headers.authorization || "";
  const [tipo, token] = cabecera.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({
      error: "token_missing",
      message: "No se envió un token de acceso. Inicie sesión para continuar.",
    });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "token_expired",
        message: "La sesión ha expirado o ya no es válida. Por favor, inicie sesión nuevamente.",
      });
    }
    // Firma alterada, token mal formado, etc.
    return res.status(401).json({
      error: "token_invalid",
      message: "La sesión ha expirado o ya no es válida. Por favor, inicie sesión nuevamente.",
    });
  }
}

// Debe usarse DESPUÉS de protegerRuta: solo deja pasar a cuentas con rol admin
function soloAdmin(req, res, next) {
  if (req.usuario?.role !== "admin") {
    return res.status(403).json({
      error: "forbidden",
      message: "No tiene permisos para realizar esta acción.",
    });
  }
  next();
}

module.exports = { generarToken, protegerRuta, soloAdmin };
