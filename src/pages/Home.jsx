import { useState, useEffect } from "react";
import { Container, Carousel, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { listarProductos } from "../api/client";
import { useAuthState } from "../context/AuthContext";
import EstadoCarga from "../components/EstadoCarga";

function Home() {
  const { isAuthenticated } = useAuthState();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GET /api/productos es privado: solo se consulta si hay sesión (token) activa
  useEffect(() => {
    if (!isAuthenticated) {
      setProductos([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    listarProductos()
      .then(setProductos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <>
      <Carousel>
        <Carousel.Item>
          <img className="d-block w-100" src="https://placehold.co/1200x400/0D3B54/FFFFFF?text=SKY+FIT" alt="Banner Sky Fit" />
          <Carousel.Caption>
            <h3>Sky Fit</h3>
            <p>Las mejores marcas de ropa deportiva femenina, en un solo lugar</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img className="d-block w-100" src="https://placehold.co/1200x400/3E8FB0/FFFFFF?text=Nueva+Coleccion" alt="Nueva colección" />
          <Carousel.Caption>
            <h3>Nueva colección</h3>
            <p>Sets pensados para verte fina dentro y fuera del gym</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      <Container className="my-5">
        <h1 className="text-center mb-3">Bienvenida a Sky Fit</h1>
        <p className="text-center text-muted mb-5">
          Reunimos en un solo lugar los outfits deportivos más aesthetic de tus marcas favoritas:
          Gymshark, Lululemon, Dfyne, Fabletics y Alo Yoga.
        </p>

        <h2 className="mb-4">Outfits destacados</h2>
        {!isAuthenticated && (
          <Card className="text-center shadow-sm">
            <Card.Body className="p-4">
              <Card.Title>Inicia sesión para ver nuestros outfits</Card.Title>
              <Card.Text className="text-muted">
                El catálogo es exclusivo para clientas registradas.
              </Card.Text>
              <Button as={Link} to="/login" className="btn-skyfit me-2">Iniciar sesión</Button>
              <Button as={Link} to="/registro" variant="outline-dark">Crear cuenta</Button>
            </Card.Body>
          </Card>
        )}
        <EstadoCarga loading={loading} error={error} texto="Cargando outfits..." />
        <Row xs={1} md={3} className="g-4">
          {productos.slice(0, 3).map((prod) => (
            <Col key={prod._id}>
              <Card className="h-100 card-product">
                <Card.Img variant="top" src={prod.imagen} />
                <Card.Body className="d-flex flex-column">
                  <Card.Subtitle className="badge-marca mb-1">{prod.marca}</Card.Subtitle>
                  <Card.Title>{prod.nombre}</Card.Title>
                  <Card.Text className="fw-bold">Q{prod.precio.toFixed(2)}</Card.Text>
                  <Button as={Link} to={`/producto/${prod._id}`} variant="dark" className="mt-auto">
                    Ver más
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
export default Home;
