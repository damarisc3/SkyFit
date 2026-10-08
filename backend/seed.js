// seed.js
// Carga los datos iniciales (los que antes estaban fijos en el frontend) en MongoDB Atlas.
// Uso: npm run seed   (BORRA y vuelve a crear las colecciones de productos y usuarios)
require("dotenv").config();
const mongoose = require("mongoose");
const conectarDB = require("./config/db");
const Producto = require("./models/Producto");
const User = require("./models/User");

const productos = [
  {
    nombre: "Legging Align Azul Cielo",
    marca: "Lululemon",
    categoria: "Leggings",
    precio: 450,
    tallas: "S, M, L, XL",
    color: "Azul cielo",
    stock: 12,
    imagen: "https://i.ebayimg.com/images/g/M18AAOSwYJdgikNH/s-l1200.jpg",
    descripcion: "Legging Align de Lululemon en azul cielo, tela ultra suave tipo segunda piel, tiro alto.",
  },
  {
    nombre: "Sports Bra Ribbed Blanco",
    marca: "Gymshark",
    categoria: "Tops y Sports Bra",
    precio: 280,
    tallas: "S, M, L",
    color: "Blanco",
    stock: 8,
    imagen:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHq5RSDlYwxTFn9YITqrpc6zNRuMYl2WjXf0jHHGHb4Q&s=10",
    descripcion: "Sports Bra Ribbed de Gymshark en blanco, soporte medio, tela acanalada.",
  },
  {
    nombre: "Conjunto Seamless Celeste",
    marca: "Dfyne",
    categoria: "Conjuntos",
    precio: 520,
    tallas: "S, M, L, XL",
    color: "Celeste",
    stock: 5,
    imagen: "https://dfyne.com/cdn/shop/files/IMG_1488-Edit-2.jpg?v=1741858584&width=1080",
    descripcion: "Conjunto seamless de Dfyne en celeste, set de bra y legging a juego.",
  },
  {
    nombre: "Short Biker Blue",
    marca: "Fabletics",
    categoria: "Shorts",
    precio: 220,
    tallas: "S, M, L, XL",
    color: "Azul",
    stock: 15,
    imagen:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGa2orwCdjbgcfBnYNSSzJrq9wDhDFyQSQ2Cfh7vUGQA&s=10",
    descripcion: "Short biker de Fabletics color azul, tiro alto, tela compresiva.",
  },
  {
    nombre: "Chaqueta Crop Windbreaker Azul",
    marca: "Alo Yoga",
    categoria: "Chaquetas",
    precio: 380,
    tallas: "S, M, L",
    color: "Azul",
    stock: 0,
    imagen: "https://cdna.lystit.com/photos/mytheresa/27703aaa/alo-yoga-blue-Playmaker-Cropped-Jacket.jpeg",
    descripcion: "Chaqueta cropped cortaviento de Alo Yoga en azul, ligera y resistente al agua.",
  },
  {
    nombre: "Top Halter Ribbed Blanco",
    marca: "Gymshark",
    categoria: "Tops y Sports Bra",
    precio: 195,
    tallas: "S, M, L",
    color: "Blanco",
    stock: 10,
    imagen:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRukjYcs7Jvg6xDJDFKC_DSJe-4OXB5oBpDoYpJBVMUg&s=10",
    descripcion: "Top halter ribbed de Gymshark en blanco, corte ajustado con escote halter.",
  },
];

// Cuentas de prueba (las contraseñas se cifran con bcrypt al guardarse)
const usuarios = [
  {
    nombre: "Damaris Cabrera",
    correo: "damaris@skyfit.com",
    password: "skyfit123",
    rol: "cliente",
    membresia: "Premium",
    pedidos: [
      { codigo: "SF-1041", fecha: "2026-08-02", productos: "Legging Align Azul Cielo", total: 450, estado: "Entregado" },
      { codigo: "SF-1077", fecha: "2026-08-21", productos: "Conjunto Seamless Celeste", total: 520, estado: "En camino" },
      {
        codigo: "SF-1102",
        fecha: "2026-09-05",
        productos: "Sports Bra Ribbed Blanco, Top Halter Ribbed Blanco",
        total: 475,
        estado: "Procesando",
      },
    ],
  },
  {
    nombre: "Ana Gómez",
    correo: "ana@correo.com",
    password: "ana12345",
    rol: "cliente",
    membresia: "Estándar",
    pedidos: [
      { codigo: "SF-1090", fecha: "2026-08-28", productos: "Short Biker Blue", total: 220, estado: "Entregado" },
    ],
  },
  {
    nombre: "Administradora Sky Fit",
    correo: "admin@skyfit.com",
    password: "admin123",
    rol: "admin",
    membresia: "Premium",
    pedidos: [],
  },
];

async function seed() {
  await conectarDB();
  try {
    await Producto.deleteMany({});
    await User.deleteMany({});

    await Producto.insertMany(productos);
    // create() (no insertMany) para que se ejecute el hook que cifra la contraseña
    for (const u of usuarios) await User.create(u);

    console.log(`🌱 Seed completado: ${productos.length} productos y ${usuarios.length} usuarios.`);
  } catch (error) {
    console.error("❌ Error en el seed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
