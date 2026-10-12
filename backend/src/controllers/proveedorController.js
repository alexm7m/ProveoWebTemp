const proveedorRepo = require('../repositories/proveedorRepository');

// HU 06: Búsqueda geoespacial de proveedores
const buscarProveedores = async (req, res) => {
  try {
    const { lat, lng, radio, cat } = req.query;
    if (!lat || !lng || !cat) {
      return res.status(400).json({ 
        exito: false, 
        error: 'Faltan parámetros de búsqueda (lat, lng, cat)' 
      });
    }

    const proveedores = await proveedorRepo.buscarProveedores(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radio) || 5000,
      cat
    );

    res.status(200).json({ 
      exito: true, 
      datos: proveedores 
    });
  } catch (error) {
    console.error('Error en buscarProveedores:', error);
    res.status(500).json({ 
      exito: false, 
      error: 'Error interno del servidor' 
    });
  }
};

// HU 07: Perfil público completo y reseñas asociadas
const obtenerDetallePerfil = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El ID del proveedor debe ser un número válido'
      });
    }

    // Usamos proveedorRepo, que coincide con la importación arriba
    const perfil = await proveedorRepo.obtenerPerfilProveedor(Number(id));

    if (!perfil) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Proveedor no encontrado'
      });
    }

    res.status(200).json({
      exito: true,
      datos: perfil
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error interno del servidor al obtener el perfil'
    });
  }
};

module.exports = {
  buscarProveedores,
  obtenerDetallePerfil
};
