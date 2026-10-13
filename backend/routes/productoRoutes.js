const express = require("express");
const {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productoController");
const { protegerRuta, soloAdmin } = require("../middleware/auth");

const router = express.Router();

// Todo el CRUD de productos requiere un token válido (Authorization: Bearer <token>)
router.use(protegerRuta);

// Consultas privadas: cualquier usuaria autenticada
// Crear, editar y eliminar: además requiere rol admin
router.route("/").get(listarProductos).post(soloAdmin, crearProducto);
router
  .route("/:id")
  .get(obtenerProducto)
  .put(soloAdmin, actualizarProducto)
  .delete(soloAdmin, eliminarProducto);

module.exports = router;
