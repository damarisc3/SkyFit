// src/components/RutaProtegida.jsx
// Envuelve las rutas que requieren sesión. Si no hay usuaria autenticada,
// redirige al login. Con soloAdmin, además exige rol "admin".
import { Navigate } from "react-router-dom";
import { useAuthState } from "../context/AuthContext";

function RutaProtegida({ children, soloAdmin = false }) {
  const { isAuthenticated, user } = useAuthState();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (soloAdmin && user.rol !== "admin") return <Navigate to="/perfil" replace />;
  return children;
}
export default RutaProtegida;
