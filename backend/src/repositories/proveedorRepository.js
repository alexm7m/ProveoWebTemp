const pool = require('../config/db');

const buscarProveedores = async (lat, lng, radio, categoria) => {
  // Usamos la fórmula de Haversine para calcular distancia en metros
  // MySQL 8.0 tiene ST_Distance_Sphere pero usamos cálculo manual por compatibilidad
  const query = `
    SELECT 
      pp.id,
      pp.nombre,
      pp.descripcion,
      pp.categoria,
      pp.zona,
      pp.codigo_postal,
      u.email,
      (
        6371000 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(pp.latitud)) * COS(RADIANS(pp.longitud) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(pp.latitud))
        )
      ) AS distancia_metros
    FROM provider_profiles pp
    JOIN users u ON pp.user_id = u.id
    WHERE u.role = 'proveedor'
      AND pp.categoria = ?
      AND (
        6371000 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(pp.latitud)) * COS(RADIANS(pp.longitud) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(pp.latitud))
        )
      ) <= ?
    ORDER BY distancia_metros ASC
  `;

  const [rows] = await pool.query(query, [lat, lng, lat, categoria, lat, lng, lat, radio]);
  return rows;
};

const obtenerPorId = async (id) => {
  const query = `
    SELECT pp.*, u.email, u.role
    FROM provider_profiles pp
    JOIN users u ON pp.user_id = u.id
    WHERE pp.id = ?
  `;
  const [rows] = await pool.query(query, [id]);
  return rows[0] || null;
};

const crearPerfil = async (userId, datos) => {
  const { nombre, descripcion, categoria, zona, codigo_postal, latitud, longitud } = datos;
  const query = `
    INSERT INTO provider_profiles (user_id, nombre, descripcion, categoria, zona, codigo_postal, latitud, longitud)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [userId, nombre, descripcion, categoria, zona, codigo_postal, latitud, longitud]);
  return { id: result.insertId, userId, ...datos };
};

const actualizarPerfil = async (id, datos) => {
  const campos = [];
  const valores = [];
  
  const permitidos = ['nombre', 'descripcion', 'categoria', 'zona', 'codigo_postal', 'latitud', 'longitud'];
  for (const campo of permitidos) {
    if (datos[campo] !== undefined) {
      campos.push(`${campo} = ?`);
      valores.push(datos[campo]);
    }
  }
  
  if (campos.length === 0) return null;
  
  valores.push(id);
  const query = `UPDATE provider_profiles SET ${campos.join(', ')} WHERE id = ?`;
  const [result] = await pool.query(query, valores);
  return result.affectedRows > 0;
};

module.exports = {
  buscarProveedores,
  obtenerPorId,
  crearPerfil,
  actualizarPerfil
};