// controllers/usuarioController.js
const User = require("../models/User");

// GET /api/usuarios/:id  → datos del perfil leídos directamente de MongoDB
async function obtenerUsuario(req, res, next) {
  try {
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
