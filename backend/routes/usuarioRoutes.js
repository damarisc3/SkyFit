const express = require("express");
const { obtenerUsuario } = require("../controllers/usuarioController");

const router = express.Router();

router.get("/:id", obtenerUsuario);

module.exports = router;
