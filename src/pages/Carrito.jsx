import { Container, Table, ListGroup, Button } from "react-bootstrap";
import productos from "../data/productos";

function Carrito() {
  const items = productos.slice(0, 3);
  const total = items.reduce((sum, p) => sum + p.precio, 0);

  return (
    <Container className="my-5">
      <h1 className="mb-4">Tu Carrito</h1>
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
            <tr key={p.id}>
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
    </Container>
  );
}
export default Carrito;