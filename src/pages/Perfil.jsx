// src/pages/Perfil.jsx
// Dashboard de la usuaria autenticada. Toda la información sale del estado global.
import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import { Container, Row, Col, Card, Badge, ListGroup, Table, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

// Color del Badge según el tipo de membresía
const colorRol = { Premium: "warning", Estándar: "info", Administrador: "dark" };
const colorEstado = { Entregado: "success", "En camino": "primary", Procesando: "secondary" };

const formatoFecha = (iso, conHora = false) =>
  new Date(iso).toLocaleString("es-GT", {
    dateStyle: "long",
    ...(conHora ? { timeStyle: "short" } : {}),
  });

function Perfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    // flushSync aplica el LOGOUT de inmediato; después redirigimos a Inicio.
    flushSync(() => logout());
    navigate("/", { replace: true });
  };

  const iniciales = user.nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalGastado = user.pedidos.reduce((sum, p) => sum + p.total, 0);

  return (
    <Container className="my-5">
      <h1 className="mb-4">Mi perfil</h1>

      <Row className="g-4">
        {/* Tarjeta de datos de la usuaria */}
        <Col md={4}>
          <Card className="card-perfil h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="avatar-perfil mx-auto mb-3">{iniciales}</div>
              <Card.Title className="mb-1">{user.nombre}</Card.Title>
              <Card.Text className="text-muted mb-2">{user.correo}</Card.Text>
              <Badge bg={colorRol[user.rol] || "secondary"} className="mb-3">
                Membresía {user.rol}
              </Badge>
            </Card.Body>

            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Miembro desde</span>
                <strong>{formatoFecha(user.miembroDesde)}</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Último acceso</span>
                <strong>{formatoFecha(user.fechaAcceso, true)}</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Pedidos realizados</span>
                <strong>{user.pedidos.length}</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Total comprado</span>
                <strong>Q{totalGastado.toFixed(2)}</strong>
              </ListGroup.Item>
            </ListGroup>

            <Card.Body>
              <Button variant="outline-danger" className="w-100" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Historial de pedidos simulado */}
        <Col md={8}>
          <Card className="h-100 shadow-sm">
            <Card.Header as="h5">Historial de pedidos</Card.Header>
            <Card.Body>
              {user.pedidos.length === 0 ? (
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
                    {user.pedidos.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-semibold">{p.id}</td>
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
    </Container>
  );
}
export default Perfil;
