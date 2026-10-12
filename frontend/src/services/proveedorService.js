const API_URL = 'http://localhost:3000/api/v1/proveedores';

export const buscarProveedoresCercanos = async (lat, lng, radio, categoria) => {
  try {
    const response = await fetch(
      `${API_URL}/buscar?lat=${lat}&lng=${lng}&radio=${radio}&cat=${encodeURIComponent(categoria)}`
    );
    const resultado = await response.json();
    if (resultado.exito) {
      return resultado.datos;
    }
    return [];
  } catch (error) {
    console.error('Error conectando con la API de proveedores:', error);
    throw error;
  }
};

export const obtenerPerfilProveedor = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const resultado = await response.json();
    if (resultado.exito) {
      return resultado.datos;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener perfil del proveedor:', error);
    throw error;
  }
};

