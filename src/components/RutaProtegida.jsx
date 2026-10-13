// src/components/RutaProtegida.jsx
// Envuelve las rutas que requieren sesión. Si no hay usuaria autenticada,
// redirige al login (guardando la ruta de origen para volver después de iniciar sesión).
// Con soloAdmin, además exige rol "admin".
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "../context/AuthContext";

function RutaProtegida({ children, soloAdmin = false }) {
  const { isAuthenticated, user } = useAuthState();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  if (soloAdmin && user.rol !== "admin") return <Navigate to="/perfil" replace />;
  return children;
}
export default RutaProtegida;
