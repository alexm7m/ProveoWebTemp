const pool = require('../config/db');

const buscarProveedores = async (lat, lng, radio, cat) => {
  try {
    // 1. Usamos CALL en lugar de SELECT * FROM
    // (El ORDER BY se debe hacer dentro del procedimiento en MySQL, no aquí)
    const query = `CALL buscar_proveedores_cercanos(?, ?, ?, ?)`;
    
    const values = [lat, lng, radio, cat];
    const [rows] = await pool.query(query, values);
    
    // 2. Al usar CALL, la librería mysql2 envuelve los resultados en un arreglo extra
    return rows[0]; 
  } catch (error) {
    console.error('Error en buscarProveedores:', error);
    throw error;
  }
};


// Obtener perfil completo y sus reseñas desde MySQL
const obtenerPerfilProveedor = async (id) => {
  // 1. Datos generales del proveedor
  const [proveedorRows] = await pool.query(
    `SELECT id, nombre, categoria, latitud, longitud, promedio_calificacion, descripcion, telefono, direccion
     FROM proveedores 
     WHERE id = ?`,
    [id]
  );

  if (proveedorRows.length === 0) {
    return null;
  }

  // 2. Reseñas asociadas
  const [resenasRows] = await pool.query(
    `SELECT id, autor, calificacion, comentario, fecha 
     FROM resenas 
     WHERE proveedor_id = ? 
     ORDER BY fecha DESC`,
    [id]
  );

  return {
    ...proveedorRows[0],
    resenas: resenasRows
  };
};




module.exports = {
   buscarProveedores,
   obtenerPerfilProveedor
};


