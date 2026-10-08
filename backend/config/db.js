// config/db.js
// Conexión persistente a MongoDB Atlas con Mongoose y control de errores.
const mongoose = require("mongoose");

async function conectarDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ Falta la variable MONGO_URI en el archivo .env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB conectado: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }

  // Eventos de la conexión después del arranque
  mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB desconectado"));
  mongoose.connection.on("reconnected", () => console.log("🔄 MongoDB reconectado"));
  mongoose.connection.on("error", (err) => console.error("❌ Error de MongoDB:", err.message));
}

module.exports = conectarDB;
