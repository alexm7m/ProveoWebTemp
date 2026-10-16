const pool = require('../config/db');

// HU 05: busca proveedores por codigo postal o por zona (colonia).
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
            p.colonia,
            p.codigo_postal,
            p.descripcion,
            p.foto_perfil_url
       FROM perfiles_proveedor p
       JOIN usuarios u ON u.id = p.usuario_id
      WHERE ${filtros.join(' AND ')}
      ORDER BY nombre`,
    params
  );
  return rows;
};

// Catalogo para el selector de zonas del buscador.
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

module.exports = { buscarPorZona, listarZonas };
