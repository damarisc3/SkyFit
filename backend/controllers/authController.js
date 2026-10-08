// controllers/authController.js
const User = require("../models/User");

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { nombre, correo, password, telefono, direccion } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ mensaje: "Nombre, correo y contraseña son obligatorios." });
    }

    const existe = await User.findOne({ correo: String(correo).toLowerCase().trim() });
    if (existe) {
      return res.status(409).json({ mensaje: "Ya existe una cuenta con ese correo." });
    }

    // El rol no se acepta desde el body: toda cuenta nueva es "cliente"
    const usuario = await User.create({ nombre, correo, password, telefono, direccion });
    res.status(201).json({ mensaje: "Cuenta creada correctamente.", usuario });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ mensaje: "Correo y contraseña son obligatorios." });
    }

    const usuario = await User.findOne({ correo: String(correo).toLowerCase().trim() }).select(
      "+password"
    );
    if (!usuario || !(await usuario.compararPassword(password))) {
      return res.status(401).json({ mensaje: "Correo o contraseña incorrectos." });
    }

    res.json({ mensaje: "Inicio de sesión exitoso.", usuario });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
