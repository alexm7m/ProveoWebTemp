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

module.exports = { buscarProveedores };

