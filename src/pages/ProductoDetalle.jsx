import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, ListGroup, Badge, Button, Modal } from "react-bootstrap";
import productos from "../data/productos";

function ProductoDetalle() {
  const { id } = useParams();
  const producto = productos.find((p) => p.id === Number(id));
  const [showModal, setShowModal] = useState(false);

  if (!producto) {
    return (
      <Container className="my-5">
        <h2>Producto no encontrado</h2>
        <Link to="/catalogo">Volver al catálogo</Link>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col md={5}>
          <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded" />
        </Col>
        <Col md={7}>
          <Badge bg="info" className="mb-2">{producto.marca}</Badge>
          <h1>{producto.nombre}</h1>
          <p className="text-muted">{producto.descripcion}</p>
          <h3 className="mb-3">Q{producto.precio.toFixed(2)}</h3>

          <ListGroup className="mb-4">
            {producto.especificaciones.map((esp) => (
              <ListGroup.Item key={esp.label}>
                <strong>{esp.label}:</strong> {esp.valor}
              </ListGroup.Item>
            ))}
          </ListGroup>

          <Button variant="dark" className="me-2">Agregar al carrito</Button>
          <Button variant="outline-secondary" onClick={() => setShowModal(true)}>
            Ver garantía y devoluciones
          </Button>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Garantía y devoluciones</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Este producto cuenta con 30 días para cambios o devoluciones, siempre que
              conserve sus etiquetas originales y no haya sido usado.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}
export default ProductoDetalle;