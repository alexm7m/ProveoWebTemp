// HU 07: Obtener perfil detallado y reseñas por ID
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
