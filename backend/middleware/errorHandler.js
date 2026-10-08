// middleware/errorHandler.js
// Respuestas de error uniformes: { mensaje, errores? }

function noEncontrado(req, res) {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Errores de validación de Mongoose
  if (err.name === "ValidationError") {
    const errores = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ mensaje: errores.join(". "), errores });
  }
  // ID con formato inválido (ej. /api/productos/abc)
  if (err.name === "CastError") {
    return res.status(400).json({ mensaje: "El identificador proporcionado no es válido." });
  }
  // Índice único duplicado (correo repetido)
  if (err.code === 11000) {
    return res.status(409).json({ mensaje: "Ya existe un registro con ese valor único." });
  }
  // JSON mal formado en el body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "El cuerpo de la petición no es JSON válido." });
  }

  console.error(err);
  res.status(500).json({ mensaje: "Error interno del servidor." });
}

module.exports = { noEncontrado, errorHandler };
