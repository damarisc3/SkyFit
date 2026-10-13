const express = require("express");
const { obtenerUsuario } = require("../controllers/usuarioController");
const { protegerRuta } = require("../middleware/auth");

const router = express.Router();

// Consulta privada: requiere token válido
router.get("/:id", protegerRuta, obtenerUsuario);

module.exports = router;
