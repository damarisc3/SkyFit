// src/pages/Catalogo.jsx
// Catálogo obtenido de GET /api/productos, con búsqueda y filtro por categoría (query params).
import { useState, useEffect, useCallback } from "react";
import { Container, Accordion, Table, Badge, Form, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { listarProductos } from "../api/client";
import EstadoCarga from "../components/EstadoCarga";
import categoriasDisponibles from "../data/categorias";

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [filtros, setFiltros] = useState({});

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProductos(await listarProductos(filtros));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const buscar = (e) => {
    e.preventDefault();
    setFiltros({ q: busqueda.trim(), categoria });
  };

  const limpiar = () => {
    setBusqueda("");
    setCategoria("");
    setFiltros({});
  };

  const categorias = [...new Set(productos.map((p) => p.categoria))];

  return (
    <Container className="my-5">
      <h1 className="mb-4">Catálogo de Productos</h1>

      <Form onSubmit={buscar} className="mb-4">
        <Row className="g-2">
          <Col md={6}>
            <Form.Control
              placeholder="Buscar por nombre, marca o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar productos"
            />
          </Col>
          <Col md={3}>
            <Form.Select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              aria-label="Filtrar por categoría"
            >
              <option value="">Todas las categorías</option>
              {categoriasDisponibles.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3} className="d-flex gap-2">
            <Button type="submit" variant="dark" className="flex-grow-1">Buscar</Button>
            <Button variant="outline-secondary" onClick={limpiar}>Limpiar</Button>
          </Col>
        </Row>
      </Form>

      <EstadoCarga loading={loading} error={error} onReintentar={cargar} texto="Cargando catálogo..." />

      {!loading && !error && productos.length === 0 && (
        <p className="text-muted">No se encontraron productos con esos filtros.</p>
      )}

      {!loading && !error && productos.length > 0 && (
        <Accordion defaultActiveKey="0" alwaysOpen>
          {categorias.map((cat, index) => (
            <Accordion.Item eventKey={String(index)} key={cat}>
              <Accordion.Header>
                {cat}
                <Badge bg="secondary" pill className="ms-2">
                  {productos.filter((p) => p.categoria === cat).length}
                </Badge>
              </Accordion.Header>
              <Accordion.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Producto</th>
                      <th>Marca</th>
                      <th>Precio</th>
                      <th>Tallas</th>
                      <th>Disponibilidad</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos
                      .filter((p) => p.categoria === cat)
                      .map((p) => (
                        <tr key={p._id}>
                          <td><img src={p.imagen} alt={p.nombre} width="70" /></td>
                          <td>{p.nombre}</td>
                          <td>{p.marca}</td>
                          <td>Q{p.precio.toFixed(2)}</td>
                          <td>{p.tallas}</td>
                          <td>
                            <Badge bg={p.stock > 0 ? "success" : "secondary"}>
                              {p.stock > 0 ? `En existencia (${p.stock})` : "Agotado"}
                            </Badge>
                          </td>
                          <td><Link to={`/producto/${p._id}`}>Ver más</Link></td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  );
}
export default Catalogo;
