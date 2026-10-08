import { useState, useEffect } from "react";
import { Container, Table, ListGroup, Button } from "react-bootstrap";
import { listarProductos } from "../api/client";
import EstadoCarga from "../components/EstadoCarga";

// El carrito sigue siendo de demostración, pero los productos vienen de la API
function Carrito() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarProductos()
      .then((productos) => setItems(productos.slice(0, 3)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = items.reduce((sum, p) => sum + p.precio, 0);

  return (
    <Container className="my-5">
      <h1 className="mb-4">Tu Carrito</h1>
      <EstadoCarga loading={loading} error={error} texto="Cargando carrito..." />

      {!loading && !error && (
        <>
          <Table responsive bordered>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td><img src={p.imagen} alt={p.nombre} width="60" /></td>
                  <td>{p.nombre}</td>
                  <td>Q{p.precio.toFixed(2)}</td>
                  <td>1</td>
                  <td>Q{p.precio.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <ListGroup className="w-50 ms-auto mb-4">
            <ListGroup.Item className="d-flex justify-content-between">
              <span>Total</span>
              <strong>Q{total.toFixed(2)}</strong>
            </ListGroup.Item>
          </ListGroup>

          <div className="text-end">
            <Button variant="dark">Finalizar compra</Button>
          </div>
        </>
      )}
    </Container>
  );
}
export default Carrito;
