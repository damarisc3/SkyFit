import { Container, Accordion, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import productos from "../data/productos";

function Catalogo() {
  const categorias = [...new Set(productos.map((p) => p.categoria))];

  return (
    <Container className="my-5">
      <h1 className="mb-4">Catálogo de Productos</h1>
      <Accordion defaultActiveKey="0" alwaysOpen>
        {categorias.map((cat, index) => (
          <Accordion.Item eventKey={String(index)} key={cat}>
            <Accordion.Header>{cat}</Accordion.Header>
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
                      <tr key={p.id}>
                        <td><img src={p.imagen} alt={p.nombre} width="70" /></td>
                        <td>{p.nombre}</td>
                        <td>{p.marca}</td>
                        <td>Q{p.precio.toFixed(2)}</td>
                        <td>{p.tallas}</td>
                        <td>
                          <Badge bg={p.stock === "En existencia" ? "success" : "secondary"}>
                            {p.stock}
                          </Badge>
                        </td>
                        <td><Link to={`/producto/${p.id}`}>Ver más</Link></td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}
export default Catalogo;