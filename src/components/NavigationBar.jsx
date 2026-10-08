import { Navbar, Nav, Container, NavDropdown, Badge } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import { useAuth } from "../context/AuthContext";

// La barra de navegación lee la sesión directamente del estado global y
// cambia en tiempo real: sin sesión muestra "Iniciar sesión"; con sesión
// muestra el nombre, un acceso al perfil y "Cerrar sesión".
function NavigationBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    // flushSync aplica el LOGOUT de inmediato; después redirigimos a Inicio.
    flushSync(() => logout());
    navigate("/", { replace: true });
  };

  return (
    <Navbar variant="dark" expand="lg" sticky="top" className="navbar-skyfit">
      <Container>
        <Navbar.Brand as={NavLink} to="/">Sky Fit</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link as={NavLink} to="/" end>Inicio</Nav.Link>
            <Nav.Link as={NavLink} to="/catalogo">Catálogo</Nav.Link>
            <Nav.Link as={NavLink} to="/carrito">Carrito</Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">Contacto</Nav.Link>

            {isAuthenticated ? (
              <NavDropdown
                align="end"
                id="menu-usuario"
                title={
                  <>
                    Hola, {user.nombre.split(" ")[0]}{" "}
                    <Badge bg="light" text="dark" className="ms-1">
                      {user.rol === "admin" ? "Admin" : user.membresia}
                    </Badge>
                  </>
                }
              >
                <NavDropdown.Item as={NavLink} to="/perfil">Mi perfil</NavDropdown.Item>
                {user.rol === "admin" && (
                  <NavDropdown.Item as={NavLink} to="/admin/productos">
                    Administrar productos
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={cerrarSesion}>Cerrar sesión</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/registro">Registrarse</Nav.Link>
                <Nav.Link as={NavLink} to="/login" className="btn-login ms-lg-2">
                  Iniciar sesión
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
export default NavigationBar;
