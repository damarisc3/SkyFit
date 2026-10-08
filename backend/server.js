// server.js
// Punto de entrada del backend de Sky Fit.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const conectarDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const productoRoutes = require("./routes/productoRoutes");
const { noEncontrado, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: solo se aceptan peticiones de los orígenes definidos en CLIENT_URL
const origenesPermitidos = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());
app.use(cors({ origin: origenesPermitidos }));
app.use(express.json());

// Ruta de salud para comprobar que el servidor está vivo
app.get("/", (_req, res) => res.json({ mensaje: "API de Sky Fit funcionando 🚀" }));

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);

app.use(noEncontrado);
app.use(errorHandler);

conectarDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`));
});
