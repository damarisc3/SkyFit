import { Container, Form, Row, Col, Button } from "react-bootstrap";

function Registro() {
  return (
    <Container className="my-5">
      <h1 className="mb-4">Crear una cuenta</h1>
      <Form>
        <Row className="mb-3">
          <Form.Group as={Col} md={6}>
            <Form.Label>Nombres</Form.Label>
            <Form.Control type="text" required />
          </Form.Group>
          <Form.Group as={Col} md={6}>
            <Form.Label>Apellidos</Form.Label>
            <Form.Control type="text" required />
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} md={6}>
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control type="email" required />
          </Form.Group>
          <Form.Group as={Col} md={6}>
            <Form.Label>Teléfono</Form.Label>
            <Form.Control type="tel" />
          </Form.Group>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Dirección</Form.Label>
          <Form.Control as="textarea" rows={2} />
        </Form.Group>
        <Row className="mb-3">
          <Form.Group as={Col} md={6}>
            <Form.Label>Usuario</Form.Label>
            <Form.Control type="text" required />
          </Form.Group>
          <Form.Group as={Col} md={6}>
            <Form.Label>Contraseña</Form.Label>
            <Form.Control type="password" required />
          </Form.Group>
        </Row>
        <Form.Check className="mb-3" label="Acepto los términos y condiciones" />
        <Button variant="dark" type="submit">Registrarme</Button>
      </Form>
    </Container>
  );
}
export default Registro;