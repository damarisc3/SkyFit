// src/pages/Login.jsx
// Formulario de inicio de sesión: valida los campos y autentica contra POST /api/auth/login.
import { useState } from "react";
import { useNavigate, Navigate, Link, useLocation } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useAuthState, useAuthDispatch, ACTIONS } from "../context/AuthContext";
import { loginApi } from "../api/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const { isAuthenticated, loading, error, sesionExpirada } = useAuthState();
  const dispatch = useAuthDispatch();
  const navigate = useNavigate();
  // Ruta protegida que la usuaria intentó abrir sin sesión (la guarda RutaProtegida)
  const desde = useLocation().state?.desde;

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({});

  // Si ya hay sesión activa no tiene sentido mostrar el login
  if (isAuthenticated) {
    return <Navigate to={desde || "/perfil"} replace />;
  }

  // Validación de campos: devuelve un objeto con los errores encontrados
  const validar = () => {
    const nuevos = {};
    if (correo.trim() === "") {
      nuevos.correo = "El correo es obligatorio.";
    } else if (!EMAIL_REGEX.test(correo.trim())) {
      nuevos.correo = "Ingresa un correo válido (ej. nombre@dominio.com).";
    }
    if (password === "") {
      nuevos.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      nuevos.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    return nuevos;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    dispatch({ type: ACTIONS.LOGIN_START });
    try {
      const { usuario, token } = await loginApi(correo.trim(), password);
      // Acción global: el usuario y el JWT del servidor se guardan en el estado transversal
      dispatch({
        type: ACTIONS.LOGIN,
        payload: { user: { ...usuario, fechaAcceso: new Date().toISOString() }, token },
      });
      navigate(desde || "/perfil", { replace: true });
    } catch (err) {
      const mensaje =
        err.status === 401 ? "Correo o contraseña incorrectos. Verifica tus datos." : err.message;
      dispatch({ type: ACTIONS.LOGIN_ERROR, payload: mensaje });
    }
  };

  return (
    <Container className="my-5" style={{ maxWidth: "460px" }}>
      <Card className="card-login shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h3 mb-1 text-center">Iniciar sesión</h1>
          <p className="text-center text-muted mb-4">Bienvenida de nuevo a Sky Fit</p>

          {/* Aviso cuando la sesión se cerró porque el token expiró o dejó de ser válido */}
          {sesionExpirada && (
            <Alert
              variant="warning"
              dismissible
              onClose={() => dispatch({ type: ACTIONS.LIMPIAR_AVISO_SESION })}
            >
              <Alert.Heading as="h2" className="h6 mb-1">Sesión finalizada</Alert.Heading>
              Su sesión ya no es válida o ha caducado. Por favor, inicie sesión nuevamente.
            </Alert>
          )}

          {desde && !sesionExpirada && (
            <Alert variant="info">Inicia sesión para ver esta sección de la tienda.</Alert>
          )}

          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => dispatch({ type: ACTIONS.LIMPIAR_ERROR })}
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="loginCorreo">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="nombre@dominio.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                isInvalid={!!errores.correo}
                autoComplete="email"
              />
              <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="loginPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!errores.password}
                autoComplete="current-password"
              />
              <Form.Control.Feedback type="invalid">{errores.password}</Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" className="btn-skyfit w-100" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Verificando...
                </>
              ) : (
                "Ingresar"
              )}
            </Button>
          </Form>

          <p className="text-center small mt-3 mb-0">
            ¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
export default Login;
