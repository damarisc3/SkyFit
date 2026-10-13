// src/components/ManejadorSesion.jsx
// Vigila el estado global de la sesión. Cuando el interceptor del cliente HTTP
// (o el temporizador del token) dispara el LOGOUT por sesión expirada, redirige
// automáticamente a /login, donde se muestra el aviso. Debe ir dentro de <BrowserRouter>.
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "../context/AuthContext";

function ManejadorSesion() {
  const { sesionExpirada } = useAuthState();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (sesionExpirada && pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [sesionExpirada, pathname, navigate]);

  return null;
}
export default ManejadorSesion;
