import { Container, Form, Button } from "react-bootstrap";

function Contacto() {
  return (
    <Container className="my-5" style={{ maxWidth: "600px" }}>
      <h1 className="mb-4">Contáctanos</h1>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Nombre completo</Form.Label>
          <Form.Control type="text" required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Correo electrónico</Form.Label>
          <Form.Control type="email" required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Asunto</Form.Label>
          <Form.Select>
            <option>Soporte técnico</option>
            <option>Estado de mi pedido</option>
            <option>Devoluciones y garantías</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mensaje</Form.Label>
          <Form.Control as="textarea" rows={4} required />
        </Form.Group>
        <Button variant="dark" type="submit">Enviar mensaje</Button>
      </Form>
    </Container>
  );
}
export default Contacto;