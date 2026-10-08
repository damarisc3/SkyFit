// src/pages/Perfil.jsx
// Dashboard de la usuaria autenticada. Al entrar consulta GET /api/usuarios/:id para
// traer sus datos directamente de MongoDB y sincroniza la respuesta con el estado global.
import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { flushSync } from "react-dom";
import { Container, Row, Col, Card, Badge, ListGroup, Table, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { obtenerUsuario } from "../api/client";
import EstadoCarga from "../components/EstadoCarga";

// Colores de los Badge
const colorMembresia = { Premium: "warning", Estándar: "info" };
const colorRol = { admin: "dark", cliente: "primary" };
const textoRol = { admin: "Administradora", cliente: "Cliente" };
const colorEstado = { Entregado: "success", "En camino": "primary", Procesando: "secondary" };

const formatoFecha = (iso, conHora = false) =>
  new Date(iso).toLocaleString("es-GT", {
    dateStyle: "long",
    ...(conHora ? { timeStyle: "short" } : {}),
  });

function Perfil() {
  const { user, logout, actualizarPerfil } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cerrarSesion = useCallback(() => {
    // flushSync aplica el LOGOUT de inmediato; después redirigimos a Inicio.
    flushSync(() => logout());
    navigate("/", { replace: true });
  }, [logout, navigate]);

  const userId = user._id;

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const datos = await obtenerUsuario(userId);
      actualizarPerfil(datos); // estado global = lo que hay en la base de datos
    } catch (err) {
      // Si la cuenta ya no existe en la BD, la sesión deja de ser válida
      if (err.status === 404 || err.status === 400) cerrarSesion();
      else setError(err.message);
    } finally {
      setLoading(false);
    }
    // actualizarPerfil y cerrarSesion se recrean en cada render; basta con el id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const pedidos = user.pedidos || [];
  const iniciales = user.nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const totalGastado = pedidos.reduce((sum, p) => sum + p.total, 0);

  return (
    <Container className="my-5">
      <h1 className="mb-4">Mi perfil</h1>

      <EstadoCarga loading={loading} error={error} onReintentar={cargar} texto="Consultando tus datos..." />

      {!loading && !error && (
        <Row className="g-4">
          {/* Tarjeta de datos de la usuaria */}
          <Col md={4}>
            <Card className="card-perfil h-100 shadow-sm">
              <Card.Body className="text-center">
                <div className="avatar-perfil mx-auto mb-3">{iniciales}</div>
                <Card.Title className="mb-1">{user.nombre}</Card.Title>
                <Card.Text className="text-muted mb-2">{user.correo}</Card.Text>
                <Badge bg={colorRol[user.rol] || "secondary"} className="me-1">
                  {textoRol[user.rol] || user.rol}
                </Badge>
                <Badge bg={colorMembresia[user.membresia] || "secondary"} text="dark">
                  Membresía {user.membresia}
                </Badge>
              </Card.Body>

              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Miembro desde</span>
                  <strong>{formatoFecha(user.createdAt)}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Última actualización</span>
                  <strong>{formatoFecha(user.updatedAt, true)}</strong>
                </ListGroup.Item>
                {user.fechaAcceso && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Último acceso</span>
                    <strong>{formatoFecha(user.fechaAcceso, true)}</strong>
                  </ListGroup.Item>
                )}
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Teléfono</span>
                  <strong>{user.telefono || "—"}</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  <span>Dirección</span>
                  <div className="fw-bold">{user.direccion || "—"}</div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Pedidos realizados</span>
                  <strong>{pedidos.length}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Total comprado</span>
                  <strong>Q{totalGastado.toFixed(2)}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="small text-muted text-break">
                  ID en MongoDB: <code>{user._id}</code>
                </ListGroup.Item>
              </ListGroup>

              <Card.Body className="d-grid gap-2">
                {user.rol === "admin" && (
                  <Button as={Link} to="/admin/productos" variant="dark">
                    Administrar productos
                  </Button>
                )}
                <Button variant="outline-danger" onClick={cerrarSesion}>
                  Cerrar sesión
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Historial de pedidos guardado en MongoDB */}
          <Col md={8}>
            <Card className="h-100 shadow-sm">
              <Card.Header as="h5">Historial de pedidos</Card.Header>
              <Card.Body>
                {pedidos.length === 0 ? (
                  <p className="text-muted mb-0">Aún no tienes pedidos registrados.</p>
                ) : (
                  <Table responsive hover className="mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Fecha</th>
                        <th>Productos</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map((p) => (
                        <tr key={p.codigo}>
                          <td className="fw-semibold">{p.codigo}</td>
                          <td>{formatoFecha(p.fecha)}</td>
                          <td>{p.productos}</td>
                          <td>Q{p.total.toFixed(2)}</td>
                          <td>
                            <Badge bg={colorEstado[p.estado] || "secondary"}>{p.estado}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}
export default Perfil;
