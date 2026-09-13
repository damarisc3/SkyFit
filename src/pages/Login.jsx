// src/pages/Login.jsx
// Formulario de inicio de sesión con validación y autenticación simulada.
import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useAuthState, useAuthDispatch, ACTIONS } from "../context/AuthContext";
import { autenticar } from "../data/usuarios";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const { isAuthenticated, loading, error } = useAuthState();
  const dispatch = useAuthDispatch();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({});

  // Si ya hay sesión activa no tiene sentido mostrar el login
  if (isAuthenticated) {
    return <Navigate to="/perfil" replace />;
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
      const usuario = await autenticar(correo, password);
      // Acción global: registra la sesión con datos estructurados
      dispatch({
        type: ACTIONS.LOGIN,
        payload: {
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol,
          fechaAcceso: usuario.fechaAcceso,
          miembroDesde: usuario.miembroDesde,
          pedidos: usuario.pedidos,
        },
      });
      navigate("/perfil");
    } catch (err) {
      dispatch({ type: ACTIONS.LOGIN_ERROR, payload: err.message });
    }
  };

  return (
    <Container className="my-5" style={{ maxWidth: "460px" }}>
      <Card className="card-login shadow-sm">
        <Card.Body className="p-4">
          <h1 className="h3 mb-1 text-center">Iniciar sesión</h1>
          <p className="text-center text-muted mb-4">Bienvenida de nuevo a Sky Fit</p>

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

        <Card.Footer className="small text-muted">
          <strong>Cuentas de prueba:</strong>
          <br />
          damaris@skyfit.com / skyfit123 (Premium)
          <br />
          ana@correo.com / ana12345 (Estándar)
        </Card.Footer>
      </Card>
    </Container>
  );
}
export default Login;
