const proveedorRepository = require('../repositories/proveedorRepository');

const obtenerDetallePerfil = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El ID del proveedor debe ser un número válido'
      });
    }

    const perfil = await proveedorRepository.obtenerPerfilProveedor(Number(id));

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
  // aquí van tus otros controladores, por ejemplo buscarProveedores,
  obtenerDetallePerfil
};