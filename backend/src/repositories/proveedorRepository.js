const db = require('../db');
const pool = require('../config/db');

// const buscarProveedores = async (latitud, longitud, radioMetros, categoria) => {
//   const result = await db.query(
//     'SELECT * FROM buscar_proveedores_cercanos($1, $2, $3, $4)',
//     [latitud, longitud, radioMetros, categoria]
//   );
//   return result.rows;
// };

const obtenerPerfil = async (usuarioId) => {
  const result = await db.query(
    `SELECT u.nombre, p.nombre_negocio, p.tipo_servicio, p.formacion,
            p.servicio_domicilio, p.colonia, p.codigo_postal, p.foto_perfil_url,
            p.fotos_trabajo, p.solo_cotizacion, p.costo_aproximado,
            p.direccion_maps, p.descripcion, p.telefono
     FROM perfiles_proveedor p
     JOIN usuarios u ON u.id = p.usuario_id
     WHERE p.usuario_id = $1`,
    [usuarioId]
  );

  return result.rows[0] || null;
};

const guardarPerfil = async (usuarioId, perfil) => {
  return db.transaction(async (client) => {
    await client.query(
      'UPDATE usuarios SET nombre = $1, telefono = $2 WHERE id = $3',
      [perfil.nombre, perfil.telefono, usuarioId]
    );

    const result = await client.query(
      `INSERT INTO perfiles_proveedor (
         usuario_id, nombre_negocio, tipo_servicio, formacion, servicio_domicilio,
         colonia, codigo_postal, foto_perfil_url, fotos_trabajo, solo_cotizacion,
         costo_aproximado, direccion_maps, descripcion, telefono
       )
       VALUES ($1, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $2)
       ON CONFLICT (usuario_id) DO UPDATE SET
         nombre_negocio = EXCLUDED.nombre_negocio,
         tipo_servicio = EXCLUDED.tipo_servicio,
         formacion = EXCLUDED.formacion,
         servicio_domicilio = EXCLUDED.servicio_domicilio,
         colonia = EXCLUDED.colonia,
         codigo_postal = EXCLUDED.codigo_postal,
         foto_perfil_url = EXCLUDED.foto_perfil_url,
         fotos_trabajo = EXCLUDED.fotos_trabajo,
         solo_cotizacion = EXCLUDED.solo_cotizacion,
         costo_aproximado = EXCLUDED.costo_aproximado,
         direccion_maps = EXCLUDED.direccion_maps,
         descripcion = EXCLUDED.descripcion,
         telefono = EXCLUDED.telefono
       RETURNING nombre_negocio, tipo_servicio, formacion, servicio_domicilio,
                 colonia, codigo_postal, foto_perfil_url, fotos_trabajo,
                 solo_cotizacion, costo_aproximado, direccion_maps, descripcion, telefono`,
      [
        usuarioId,
        perfil.telefono,
        perfil.nombre_negocio,
        perfil.tipo_servicio,
        perfil.formacion,
        perfil.servicio_domicilio,
        perfil.colonia,
        perfil.codigo_postal,
        perfil.foto_perfil_url,
        perfil.fotos_trabajo,
        perfil.solo_cotizacion,
        perfil.costo_aproximado,
        perfil.direccion_maps,
        perfil.descripcion,
      ]
    );

    return { nombre: perfil.nombre, ...result.rows[0] };
  });
};

// HU 05/06: busca proveedores por codigo postal o por zona (colonia).
// Devuelve los datos de las tarjetas del directorio (HU 06): nombre,
// categorias, zona, calificacion promedio y total de resenas.
const buscarPorZona = async ({ codigo_postal, zona }) => {
  const filtros = ["u.rol = 'proveedor'", "u.estatus = 'activo'"];
  const params = [];
  
  if (codigo_postal) {
    filtros.push('p.codigo_postal = ?');
    params.push(codigo_postal);
  } else {
    filtros.push('p.colonia = ?');
    params.push(zona);
  }
  
  const [rows] = await pool.query(
    `SELECT p.usuario_id AS id,
            COALESCE(p.nombre_negocio, u.nombre) AS nombre,
            COALESCE(GROUP_CONCAT(c.nombre ORDER BY c.nombre SEPARATOR ', '), 'Sin categoria') AS categorias,
            p.colonia,
            p.codigo_postal,
            p.promedio_calificacion AS calificacion,
            p.total_resenas,
            p.foto_perfil_url,
            p.descripcion,
            p.telefono
            FROM perfiles_proveedor p
            JOIN usuarios u ON u.id = p.usuario_id
            LEFT JOIN proveedor_categorias pc ON pc.proveedor_id = p.usuario_id
            LEFT JOIN categorias c ON c.id = pc.categoria_id
            WHERE ${filtros.join(' AND ')}
            GROUP BY p.usuario_id
            ORDER BY calificacion DESC, p.total_resenas DESC`,
            params
          );
          return rows;
};
        
// Catalogo para el selector de zonas del buscador (HU 05).
// Mientras la tabla zonas este vacia, las colonias registradas en perfiles
// hacen de catalogo para que el buscador siga siendo util.
const listarZonas = async () => {
  const [zonas] = await pool.query(
    'SELECT id, codigo_postal, colonia, ciudad FROM zonas ORDER BY colonia'
  );
  if (zonas.length > 0) return zonas;
  
  const [colonia] = await pool.query(
    `SELECT colonia, codigo_postal
    FROM perfiles_proveedor
    WHERE colonia IS NOT NULL AND colonia <> ''
    GROUP BY colonia, codigo_postal
    ORDER BY colonia`
  );
  return colonia.map((z) => ({ id: null, ciudad: null, ...z }));
};

// Catalogo para el filtro por categoria de servicio (HU 06).
const listarCategorias = async () => {
  const [rows] = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre');
  return rows;
};

// Perfil detallado al que se redirige al hacer clic en una tarjeta (HU 06).
const obtenerPorId = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.usuario_id AS id,
    COALESCE(p.nombre_negocio, u.nombre) AS nombre,
    COALESCE(GROUP_CONCAT(c.nombre ORDER BY c.nombre SEPARATOR ', '), 'Sin categoria') AS categorias,
    p.tipo_servicio,
    p.titulo_profesional,
    p.formacion,
    p.descripcion,
    p.telefono,
    p.colonia,
    p.codigo_postal,
    p.foto_perfil_url,
    p.promedio_calificacion AS calificacion,
    p.total_resenas
    FROM perfiles_proveedor p
    JOIN usuarios u ON u.id = p.usuario_id
    LEFT JOIN proveedor_categorias pc ON pc.proveedor_id = p.usuario_id
    LEFT JOIN categorias c ON c.id = pc.categoria_id
    WHERE p.usuario_id = ?
    GROUP BY p.usuario_id`,
    [id]
  );
  return rows[0] || null;
};
      


// HU 06-07: funcion repetitiva para buscar proveedores
// const buscarProveedores = async (lat, lng, radio, cat) => {
//   try {
//     // 1. Usamos CALL en lugar de SELECT * FROM
//     // (El ORDER BY se debe hacer dentro del procedimiento en MySQL, no aquí)
//     const query = `CALL buscar_proveedores_cercanos(?, ?, ?, ?)`;

//     const values = [lat, lng, radio, cat];
//     const [rows] = await pool.query(query, values);

//     // 2. Al usar CALL, la librería mysql2 envuelve los resultados en un arreglo extra
//     return rows[0]; 
//   } catch (error) {
//     console.error('Error en buscarProveedores:', error);
//     throw error;
//   }
// };
      
      
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

// const obtenerPorId = async (id) => {
//   const query = `
//     SELECT pp.*, u.email, u.role
//     FROM provider_profiles pp
//     JOIN users u ON pp.user_id = u.id
//     WHERE pp.id = ?
//   `;
//   const [rows] = await pool.query(query, [id]);
//   return rows[0] || null;
// };

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

module.exports = { buscarPorZona, listarZonas, listarCategorias, obtenerPorId, buscarProveedores, obtenerPerfil, guardarPerfil, obtenerPerfilProveedor, crearPerfil, actualizarPerfil };
// module.exports = {
//    buscarProveedores,
//    obtenerPerfilProveedor
// };
// module.exports = {
//   buscarProveedores,
//   obtenerPorId,
//   crearPerfil,
//   actualizarPerfil
// };
