// controllers/productoController.js
const Producto = require("../models/Producto");

// Escapa caracteres especiales para usar el texto de búsqueda en una RegExp
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/productos?q=&categoria=&marca=&min=&max=
async function listarProductos(req, res, next) {
  try {
    const { q, categoria, marca, min, max } = req.query;
    const filtro = {};

    if (q) {
      const regex = new RegExp(escaparRegex(String(q)), "i");
      filtro.$or = [{ nombre: regex }, { descripcion: regex }, { marca: regex }];
    }
    if (categoria) filtro.categoria = String(categoria);
    if (marca) filtro.marca = String(marca);
    if (min || max) {
      filtro.precio = {};
      if (min) filtro.precio.$gte = Number(min);
      if (max) filtro.precio.$lte = Number(max);
    }

    const productos = await Producto.find(filtro).sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    next(error);
  }
}

// GET /api/productos/:id
async function obtenerProducto(req, res, next) {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado." });
    }
    res.json(producto);
  } catch (error) {
    next(error);
  }
}

// POST /api/productos
async function crearProducto(req, res, next) {
  try {
    const producto = await Producto.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
}

// PUT /api/productos/:id
async function actualizarProducto(req, res, next) {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after", // devuelve el documento ya actualizado
      runValidators: true,
    });
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado." });
    }
    res.json(producto);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/productos/:id
async function eliminarProducto(req, res, next) {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado." });
    }
    res.json({ mensaje: "Producto eliminado correctamente.", producto });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
