// src/components/EstadoCarga.jsx
// Muestra un Spinner mientras se espera al servidor, o un Alert si la petición falló.
import { Spinner, Alert, Button } from "react-bootstrap";

function EstadoCarga({ loading, error, onReintentar, texto = "Cargando..." }) {
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" className="mb-2" />
        <p className="text-muted mb-0">{texto}</p>
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        <Alert.Heading as="h6">No pudimos obtener la información</Alert.Heading>
        <p className="mb-2">{error}</p>
        {onReintentar && (
          <Button size="sm" variant="outline-danger" onClick={onReintentar}>
            Reintentar
          </Button>
        )}
      </Alert>
    );
  }
  return null;
}
export default EstadoCarga;
