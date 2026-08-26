import { Navbar, Nav, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";

function NavigationBar() {
  return (
    <Navbar variant="dark" expand="lg" sticky="top" className="navbar-skyfit">
      <Container>
        <Navbar.Brand as={NavLink} to="/">Sky Fit</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/" end>Inicio</Nav.Link>
            <Nav.Link as={NavLink} to="/catalogo">Catálogo</Nav.Link>
            <Nav.Link as={NavLink} to="/carrito">Carrito</Nav.Link>
            <Nav.Link as={NavLink} to="/registro">Registrarse</Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">Contacto</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default NavigationBar;