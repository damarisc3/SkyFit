// models/Producto.js
// Entidad de negocio de Sky Fit: productos del catálogo.
const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: [true, "El nombre es obligatorio"], trim: true },
    marca: { type: String, required: [true, "La marca es obligatoria"], trim: true },
    categoria: { type: String, required: [true, "La categoría es obligatoria"], trim: true },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    tallas: { type: String, default: "S, M, L" },
    color: { type: String, trim: true },
    stock: { type: Number, default: 0, min: [0, "El stock no puede ser negativo"] },
    imagen: { type: String, default: "https://placehold.co/600x600?text=Sky+Fit" },
    descripcion: { type: String, default: "" },
  },
  { timestamps: true }
);

productoSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Producto", productoSchema);
