// src/pages/AdminProductos.jsx
// Panel de administración: crear (POST), editar (PUT) y eliminar (DELETE) productos en MongoDB.
import { useState, useEffect, useCallback } from "react";
import { Container, Table, Button, Badge, Modal, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../api/client";
import EstadoCarga from "../components/EstadoCarga";
import categorias from "../data/categorias";

const productoVacio = {
  nombre: "",
  marca: "",
  categoria: categorias[0],
  precio: "",
  tallas: "S, M, L",
  color: "",
  stock: "",
  imagen: "",
  descripcion: "",
};

function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null); // { variant, texto }

  // Modal de crear/editar
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(productoVacio);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  // Modal de confirmación de borrado
  const [porEliminar, setPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProductos(await listarProductos());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(productoVacio);
    setErrorForm(null);
    setMostrarForm(true);
  };

  const abrirEditar = (p) => {
    setEditandoId(p._id);
    setForm({
      nombre: p.nombre,
      marca: p.marca,
      categoria: p.categoria,
      precio: p.precio,
      tallas: p.tallas || "",
      color: p.color || "",
      stock: p.stock,
      imagen: p.imagen || "",
      descripcion: p.descripcion || "",
    });
    setErrorForm(null);
    setMostrarForm(true);
  };

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorForm(null);

    const datos = { ...form, precio: Number(form.precio), stock: Number(form.stock || 0) };
    if (!datos.imagen) delete datos.imagen; // usa la imagen por defecto del modelo

    try {
      if (editandoId) {
        const actualizado = await actualizarProducto(editandoId, datos);
        setProductos((lista) => lista.map((p) => (p._id === editandoId ? actualizado : p)));
        setAviso({ variant: "success", texto: `"${actualizado.nombre}" se actualizó correctamente.` });
      } else {
        const nuevo = await crearProducto(datos);
        setProductos((lista) => [nuevo, ...lista]);
        setAviso({ variant: "success", texto: `"${nuevo.nombre}" se creó correctamente.` });
      }
      setMostrarForm(false);
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await eliminarProducto(porEliminar._id);
      setProductos((lista) => lista.filter((p) => p._id !== porEliminar._id));
      setAviso({ variant: "success", texto: `"${porEliminar.nombre}" se eliminó de la base de datos.` });
    } catch (err) {
      setAviso({ variant: "danger", texto: err.message });
    } finally {
      setEliminando(false);
      setPorEliminar(null);
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Administrar productos</h1>
        <Button variant="dark" onClick={abrirNuevo}>+ Nuevo producto</Button>
      </div>

      {aviso && (
        <Alert variant={aviso.variant} dismissible onClose={() => setAviso(null)}>
          {aviso.texto}
        </Alert>
      )}

      <EstadoCarga loading={loading} error={error} onReintentar={cargar} texto="Cargando productos..." />

      {!loading && !error && (
        <Table responsive hover bordered className="align-middle">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Actualizado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted">No hay productos registrados.</td>
              </tr>
            )}
            {productos.map((p) => (
              <tr key={p._id}>
                <td><img src={p.imagen} alt={p.nombre} width="50" /></td>
                <td>
                  <div className="fw-semibold">{p.nombre}</div>
                  <small className="text-muted">{p.marca}</small>
                </td>
                <td>{p.categoria}</td>
                <td>Q{p.precio.toFixed(2)}</td>
                <td>
                  <Badge bg={p.stock > 0 ? "success" : "secondary"}>{p.stock}</Badge>
                </td>
                <td className="small">{new Date(p.updatedAt).toLocaleString("es-GT")}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-primary" className="me-2" onClick={() => abrirEditar(p)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => setPorEliminar(p)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal crear / editar */}
      <Modal show={mostrarForm} onHide={() => setMostrarForm(false)} size="lg">
        <Form onSubmit={guardar}>
          <Modal.Header closeButton>
            <Modal.Title>{editandoId ? "Editar producto" : "Nuevo producto"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {errorForm && <Alert variant="danger">{errorForm}</Alert>}
            <Row className="g-3">
              <Form.Group as={Col} md={8} controlId="admNombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control name="nombre" value={form.nombre} onChange={cambiar} required />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="admMarca">
                <Form.Label>Marca</Form.Label>
                <Form.Control name="marca" value={form.marca} onChange={cambiar} required />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="admCategoria">
                <Form.Label>Categoría</Form.Label>
                <Form.Select name="categoria" value={form.categoria} onChange={cambiar}>
                  {categorias.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="admPrecio">
                <Form.Label>Precio (Q)</Form.Label>
                <Form.Control type="number" min="0" step="0.01" name="precio" value={form.precio} onChange={cambiar} required />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="admStock">
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" min="0" name="stock" value={form.stock} onChange={cambiar} />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="admTallas">
                <Form.Label>Tallas</Form.Label>
                <Form.Control name="tallas" value={form.tallas} onChange={cambiar} />
              </Form.Group>
              <Form.Group as={Col} md={6} controlId="admColor">
                <Form.Label>Color</Form.Label>
                <Form.Control name="color" value={form.color} onChange={cambiar} />
              </Form.Group>
              <Form.Group as={Col} xs={12} controlId="admImagen">
                <Form.Label>URL de la imagen</Form.Label>
                <Form.Control type="url" name="imagen" value={form.imagen} onChange={cambiar} placeholder="https://..." />
              </Form.Group>
              <Form.Group as={Col} xs={12} controlId="admDescripcion">
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" rows={3} name="descripcion" value={form.descripcion} onChange={cambiar} />
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setMostrarForm(false)}>Cancelar</Button>
            <Button type="submit" variant="dark" disabled={guardando}>
              {guardando && <Spinner size="sm" animation="border" className="me-2" />}
              {editandoId ? "Guardar cambios" : "Crear producto"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal confirmar borrado */}
      <Modal show={!!porEliminar} onHide={() => setPorEliminar(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Seguro que deseas eliminar <strong>{porEliminar?.nombre}</strong>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPorEliminar(null)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarEliminar} disabled={eliminando}>
            {eliminando && <Spinner size="sm" animation="border" className="me-2" />}
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
export default AdminProductos;
