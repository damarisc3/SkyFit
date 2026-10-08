// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Pedidos guardados dentro de cada usuaria (historial que se muestra en el perfil)
const pedidoSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    productos: { type: String, required: true },
    total: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ["Procesando", "En camino", "Entregado"],
      default: "Procesando",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre completo es obligatorio"],
      trim: true,
    },
    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Correo electrónico no válido"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false, // nunca se devuelve en las consultas salvo que se pida
    },
    rol: { type: String, enum: ["admin", "cliente"], default: "cliente" },
    membresia: { type: String, enum: ["Estándar", "Premium"], default: "Estándar" },
    telefono: { type: String, trim: true },
    direccion: { type: String, trim: true },
    pedidos: [pedidoSchema],
  },
  { timestamps: true } // createdAt y updatedAt
);

// Cifra la contraseña antes de guardar (solo si cambió)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.compararPassword = function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

// Al convertir a JSON se elimina la contraseña por seguridad
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
