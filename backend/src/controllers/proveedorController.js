const proveedorRepo = require('../repositories/proveedorRepository');
const obtenerProveedores = async (req, res) => {
  try {
    const { lat, lng, radio, cat } = req.query;
    if (!lat || !lng || !cat) {
      return res.status(400).json({ error: 'Faltan parámetros de búsqueda' });
    }
    
    const proveedores = await proveedorRepo.buscarProveedores(
      parseFloat(lat), parseFloat(lng), parseInt(radio) || 5000, cat
    );
    
    res.status(200).json({ exito: true, datos: proveedores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { obtenerProveedores };