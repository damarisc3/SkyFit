// src/components/RutaProtegida.jsx
// Envuelve las rutas que requieren sesión. Si no hay usuaria autenticada,
// redirige al login. Lee la sesión del estado global, no de props.
import { Navigate } from "react-router-dom";
import { useAuthState } from "../context/AuthContext";

function RutaProtegida({ children }) {
  const { isAuthenticated } = useAuthState();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
export default RutaProtegida;
