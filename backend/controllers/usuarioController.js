// controllers/usuarioController.js
const User = require("../models/User");

// GET /api/usuarios/:id  → datos del perfil leídos directamente de MongoDB (ruta protegida)
async function obtenerUsuario(req, res, next) {
  try {
    // Cada usuaria solo puede ver su propio perfil; la admin puede ver cualquiera
    if (req.usuario.id !== req.params.id && req.usuario.role !== "admin") {
      return res.status(403).json({
        error: "forbidden",
        message: "No tiene permisos para ver este perfil.",
      });
    }
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

module.exports = { obtenerUsuario };
