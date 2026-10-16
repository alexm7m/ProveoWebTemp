const pool = require('../config/db');

const conCotizable = (s) => ({
  ...s,
  precio_referencia: s.precio_referencia === null ? null : Number(s.precio_referencia),
  cotizable: s.precio_referencia === null,
});
const esCP = (v) => /^\d{5}$/.test(v);

exports.buscarPorZona = async (req, res) => {
  const { cp, zona_id: zonaId } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  if (!cp && !zonaId) return res.status(400).json({ error: 'Indica un código postal o selecciona una zona.' });
  if (cp && !esCP(cp)) return res.status(400).json({ error: 'El código postal debe tener 5 dígitos.' });
  if (zonaId && !/^\d+$/.test(zonaId)) return res.status(400).json({ error: 'La zona no es válida.' });

  const cond = [];
  const params = [];
  if (cp) {
    cond.push(`(p.codigo_postal = ? OR EXISTS (
      SELECT 1 FROM proveedor_zonas pz JOIN zonas z ON z.id = pz.zona_id
       WHERE pz.proveedor_id = p.usuario_id AND z.codigo_postal = ?))`);
    params.push(cp, cp);
  }
  if (zonaId) {
    cond.push(`EXISTS (SELECT 1 FROM proveedor_zonas pz
                        WHERE pz.proveedor_id = p.usuario_id AND pz.zona_id = ?)`);
    params.push(zonaId);
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, p.nombre_negocio, p.titulo_profesional, p.colonia,
              p.codigo_postal, p.foto_url, p.promedio_calificacion, p.total_resenas
         FROM perfiles_proveedor p
         JOIN usuarios u ON u.id = p.usuario_id
        WHERE u.rol = 'proveedor' AND u.estatus = 'activo' AND (${cond.join(' OR ')})
        ORDER BY p.promedio_calificacion DESC, p.total_resenas DESC
        LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );
    res.json({
      page, limit, data: rows,
      mensaje: rows.length ? null : 'No hay proveedores registrados en esta zona por el momento.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo realizar la búsqueda.' });
  }
};

exports.listarZonas = async (req, res) => {
  const { cp } = req.query;
  if (cp && !esCP(cp)) return res.status(400).json({ error: 'El código postal debe tener 5 dígitos.' });
  try {
    const [rows] = await pool.query(
      `SELECT id, codigo_postal, colonia, ciudad, estado_republica
         FROM zonas WHERE (? IS NULL OR codigo_postal = ?)
        ORDER BY estado_republica, ciudad, colonia`,
      [cp || null, cp || null]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener las zonas.' });
  }
};

const validarServicio = (body) => {
  const titulo = (body.titulo || '').trim();
  const descripcion = body.descripcion ? String(body.descripcion).trim().slice(0, 500) : null;
  let precio = body.precio_referencia;
  if (!titulo || titulo.length > 150) return { error: 'El título es obligatorio (máximo 150 caracteres).' };
  if (precio === undefined || precio === null || precio === '') precio = null;
  else if (!(Number(precio) >= 0)) return { error: 'El precio no es válido.' };
  return { valor: { titulo, descripcion, precio: precio === null ? null : Number(precio) } };
};

exports.listarServicios = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, titulo, descripcion, precio_referencia FROM servicios WHERE proveedor_id = ? ORDER BY titulo',
      [req.user.id]
    );
    res.json({ data: rows.map(conCotizable) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron obtener los servicios.' });
  }
};

exports.crearServicio = async (req, res) => {
  const { error, valor } = validarServicio(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const [r] = await pool.query(
      'INSERT INTO servicios (proveedor_id, titulo, descripcion, precio_referencia) VALUES (?,?,?,?)',
      [req.user.id, valor.titulo, valor.descripcion, valor.precio]
    );
    res.status(201).json(conCotizable({
      id: r.insertId, titulo: valor.titulo, descripcion: valor.descripcion, precio_referencia: valor.precio,
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo crear el servicio.' });
  }
};

exports.actualizarServicio = async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Identificador no válido.' });
  const { error, valor } = validarServicio(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const [r] = await pool.query(
      `UPDATE servicios SET titulo = ?, descripcion = ?, precio_referencia = ?
        WHERE id = ? AND proveedor_id = ?`,
      [valor.titulo, valor.descripcion, valor.precio, req.params.id, req.user.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: 'Servicio no encontrado.' });
    res.json(conCotizable({
      id: Number(req.params.id), titulo: valor.titulo, descripcion: valor.descripcion, precio_referencia: valor.precio,
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo actualizar el servicio.' });
  }
};

exports.eliminarServicio = async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Identificador no válido.' });
  try {
    const [r] = await pool.query('DELETE FROM servicios WHERE id = ? AND proveedor_id = ?', [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Servicio no encontrado.' });
    res.status(204).end();
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'El servicio tiene solicitudes asociadas y no se puede eliminar.' });
    }
    console.error(err);
    res.status(500).json({ error: 'No se pudo eliminar el servicio.' });
  }
};