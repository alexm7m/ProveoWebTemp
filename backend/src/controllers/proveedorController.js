const proveedorRepo = require('../repositories/proveedorRepository');

// Codigos postales mexicanos: 5 digitos.
const CODIGO_POSTAL_REGEX = /^\d{5}$/;

// HU 05: GET /api/proveedores/buscar?codigo_postal=XXXXX  o  ?zona=Colonia
const buscarProveedores = async (req, res) => {
  const codigo_postal =
    typeof req.query.codigo_postal === 'string' ? req.query.codigo_postal.trim() : '';
  const zona = typeof req.query.zona === 'string' ? req.query.zona.trim() : '';

  if (!codigo_postal && !zona) {
    return res.status(400).json({ error: 'Indica un codigo postal o selecciona una zona.' });
  }
  if (codigo_postal && !CODIGO_POSTAL_REGEX.test(codigo_postal)) {
    return res.status(400).json({ error: 'El codigo postal debe tener 5 digitos.' });
  }
  if (zona && zona.length > 150) {
    return res.status(400).json({ error: 'La zona indicada no es valida.' });
  }

  try {
    // Si llegan los dos, el codigo postal tiene prioridad.
    const proveedores = await proveedorRepo.buscarPorZona({
      codigo_postal: codigo_postal || null,
      zona: codigo_postal ? null : zona,
    });
    return res.json({ total: proveedores.length, proveedores });
  } catch (err) {
    console.error('Error al buscar proveedores:', err);
    return res.status(500).json({ error: 'No fue posible realizar la busqueda.' });
  }
};

// Catalogo de zonas para el selector del buscador (HU 05).
const listarZonas = async (req, res) => {
  try {
    const zonas = await proveedorRepo.listarZonas();
    return res.json({ zonas });
  } catch (err) {
    console.error('Error al listar zonas:', err);
    return res.status(500).json({ error: 'No fue posible cargar las zonas.' });
  }
};

module.exports = { buscarProveedores, listarZonas };
