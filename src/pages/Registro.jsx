// src/pages/Registro.jsx
// Registro real: envía los datos a POST /api/auth/register y, si todo sale bien,
// inicia la sesión con el usuario recién creado en MongoDB.
import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Container, Form, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { registerApi } from "../api/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formInicial = {
  nombres: "",
  apellidos: "",
  correo: "",
  telefono: "",
  direccion: "",
  password: "",
  confirmar: "",
  terminos: false,
};

function Registro() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(formInicial);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/perfil" replace />;
  }

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const validar = () => {
    const nuevos = {};
    if (!form.nombres.trim()) nuevos.nombres = "Ingresa tus nombres.";
    if (!form.apellidos.trim()) nuevos.apellidos = "Ingresa tus apellidos.";
    if (!EMAIL_REGEX.test(form.correo.trim())) nuevos.correo = "Ingresa un correo válido.";
    if (form.password.length < 6) nuevos.password = "Mínimo 6 caracteres.";
    if (form.confirmar !== form.password) nuevos.confirmar = "Las contraseñas no coinciden.";
    if (!form.terminos) nuevos.terminos = "Debes aceptar los términos y condiciones.";
    return nuevos;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    setErrorServidor(null);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    try {
      const { usuario } = await registerApi({
        nombre: `${form.nombres.trim()} ${form.apellidos.trim()}`,
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        password: form.password,
      });
      login({ ...usuario, fechaAcceso: new Date().toISOString() });
      navigate("/perfil");
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Container className="my-5" style={{ maxWidth: "820px" }}>
      <h1 className="mb-4">Crear una cuenta</h1>

      {errorServidor && (
        <Alert variant="danger" dismissible onClose={() => setErrorServidor(null)}>
          {errorServidor}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        <Row className="mb-3">
          <Form.Group as={Col} md={6} controlId="regNombres">
            <Form.Label>Nombres</Form.Label>
            <Form.Control name="nombres" value={form.nombres} onChange={cambiar} isInvalid={!!errores.nombres} />
            <Form.Control.Feedback type="invalid">{errores.nombres}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md={6} controlId="regApellidos">
            <Form.Label>Apellidos</Form.Label>
            <Form.Control name="apellidos" value={form.apellidos} onChange={cambiar} isInvalid={!!errores.apellidos} />
            <Form.Control.Feedback type="invalid">{errores.apellidos}</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} md={6} controlId="regCorreo">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={form.correo}
              onChange={cambiar}
              isInvalid={!!errores.correo}
              autoComplete="email"
            />
            <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md={6} controlId="regTelefono">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control type="tel" name="telefono" value={form.telefono} onChange={cambiar} />
          </Form.Group>
        </Row>
        <Form.Group className="mb-3" controlId="regDireccion">
          <Form.Label>Dirección</Form.Label>
          <Form.Control as="textarea" rows={2} name="direccion" value={form.direccion} onChange={cambiar} />
        </Form.Group>
        <Row className="mb-3">
          <Form.Group as={Col} md={6} controlId="regPassword">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={cambiar}
              isInvalid={!!errores.password}
              autoComplete="new-password"
            />
            <Form.Control.Feedback type="invalid">{errores.password}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md={6} controlId="regConfirmar">
            <Form.Label>Confirmar contraseña</Form.Label>
            <Form.Control
              type="password"
              name="confirmar"
              value={form.confirmar}
              onChange={cambiar}
              isInvalid={!!errores.confirmar}
              autoComplete="new-password"
            />
            <Form.Control.Feedback type="invalid">{errores.confirmar}</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Form.Check
          className="mb-3"
          id="regTerminos"
          name="terminos"
          checked={form.terminos}
          onChange={cambiar}
          isInvalid={!!errores.terminos}
          feedback={errores.terminos}
          feedbackType="invalid"
          label="Acepto los términos y condiciones"
        />
        <Button variant="dark" type="submit" disabled={enviando}>
          {enviando ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Creando cuenta...
            </>
          ) : (
            "Registrarme"
          )}
        </Button>
        <span className="ms-3 small">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </span>
      </Form>
    </Container>
  );
}
export default Registro;
