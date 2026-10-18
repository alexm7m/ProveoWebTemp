const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const autenticar = require('../middlewares/auth');
const permitirRoles = require('../middlewares/roles');
const { uploadProfileImages } = require('../middlewares/profileImageUpload');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/me', verificarToken, proveedorController.getMyProfile);
router.put('/me', verificarToken, proveedorController.saveOrUpdateProfile);

router.get('/perfil', autenticar, permitirRoles('proveedor'), proveedorController.obtenerPerfil);
router.put('/perfil', autenticar, permitirRoles('proveedor'), proveedorController.actualizarPerfil);
router.post(
  '/perfil/imagenes',
  autenticar,
  permitirRoles('proveedor'),
  uploadProfileImages,
  proveedorController.subirImagenesPerfil
);

// HU 05: busqueda por codigo postal o zona
// router.get('/buscar', proveedorController.obtenerProveedores);
router.get('/buscar', proveedorController.buscarProveedores);

// HU 05: catalogo de zonas para el selector
router.get('/zonas', proveedorController.listarZonas);

// HU 06: catalogo de categorias para el filtro del listado
router.get('/categorias', proveedorController.listarCategorias);

// HU 06: perfil detallado (siempre al final: no tapa las rutas literales)
router.get('/:id', proveedorController.obtenerDetalle);

module.exports = router;
