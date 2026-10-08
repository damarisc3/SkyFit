// src/pages/ProductoDetalle.jsx
// Detalle de un producto obtenido de GET /api/productos/:id
import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, ListGroup, Badge, Button, Modal } from "react-bootstrap";
import { obtenerProducto } from "../api/client";
import EstadoCarga from "../components/EstadoCarga";

function ProductoDetalle() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoEncontrado(false);
    try {
      setProducto(await obtenerProducto(id));
    } catch (err) {
      // 404 = no existe, 400 = id con formato inválido
      if (err.status === 404 || err.status === 400) setNoEncontrado(true);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (loading || error) {
    return (
      <Container className="my-5">
        <EstadoCarga loading={loading} error={error} onReintentar={cargar} texto="Cargando producto..." />
      </Container>
    );
  }

  if (noEncontrado || !producto) {
    return (
      <Container className="my-5">
        <h2>Producto no encontrado</h2>
        <Link to="/catalogo">Volver al catálogo</Link>
      </Container>
    );
  }

  const especificaciones = [
    { label: "Marca", valor: producto.marca },
    { label: "Categoría", valor: producto.categoria },
    { label: "Tallas", valor: producto.tallas },
    { label: "Color", valor: producto.color || "—" },
    { label: "Unidades disponibles", valor: producto.stock },
  ];

  return (
    <Container className="my-5">
      <Row>
        <Col md={5}>
          <img src={producto.imagen} alt={producto.nombre} className="img-fluid rounded" />
        </Col>
        <Col md={7}>
          <Badge bg="info" className="mb-2 me-2">{producto.marca}</Badge>
          <Badge bg={producto.stock > 0 ? "success" : "secondary"} className="mb-2">
            {producto.stock > 0 ? "En existencia" : "Agotado"}
          </Badge>
          <h1>{producto.nombre}</h1>
          <p className="text-muted">{producto.descripcion}</p>
          <h3 className="mb-3">Q{producto.precio.toFixed(2)}</h3>

          <ListGroup className="mb-4">
            {especificaciones.map((esp) => (
              <ListGroup.Item key={esp.label}>
                <strong>{esp.label}:</strong> {esp.valor}
              </ListGroup.Item>
            ))}
          </ListGroup>

          <Button variant="dark" className="me-2" disabled={producto.stock === 0}>
            Agregar al carrito
          </Button>
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
