const express = require("express");
const {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productoController");

const router = express.Router();

router.route("/").get(listarProductos).post(crearProducto);
router.route("/:id").get(obtenerProducto).put(actualizarProducto).delete(eliminarProducto);

module.exports = router;
