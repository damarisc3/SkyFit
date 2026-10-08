import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import RutaProtegida from "./components/RutaProtegida";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import ProductoDetalle from "./pages/ProductoDetalle";
import Carrito from "./pages/Carrito";
import Registro from "./pages/Registro";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import AdminProductos from "./pages/AdminProductos";

function App() {
  return (
    // AuthProvider envuelve toda la app: cualquier componente puede leer la sesión
    <AuthProvider>
      <BrowserRouter>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/perfil"
            element={
              <RutaProtegida>
                <Perfil />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/productos"
            element={
              <RutaProtegida soloAdmin>
                <AdminProductos />
              </RutaProtegida>
            }
          />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
