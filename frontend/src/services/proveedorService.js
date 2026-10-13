import api from './api';

// HU 05: buscar proveedores por codigo postal o por zona.
// Envia solo uno de los dos parametros; el backend prioriza el codigo postal.
export const buscarProveedores = async ({ codigoPostal, zona }) => {
  const { data } = await api.get('/proveedores/buscar', {
    params: codigoPostal ? { codigo_postal: codigoPostal } : { zona },
  });
  return data.proveedores;
};

// HU 05: catalogo de zonas para el selector del buscador.
export const listarZonas = async () => {
  const { data } = await api.get('/proveedores/zonas');
  return data.zonas;
};

// HU 06: catalogo de categorias para el filtro del listado.
export const listarCategorias = async () => {
  const { data } = await api.get('/proveedores/categorias');
  return data.categorias;
};

// HU 06: perfil detallado al que redirige cada tarjeta.
export const obtenerProveedor = async (id) => {
  const { data } = await api.get(`/proveedores/${id}`);
  return data.proveedor;
};
