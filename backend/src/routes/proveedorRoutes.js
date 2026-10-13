const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

// HU 05: busqueda por codigo postal o zona
router.get('/buscar', proveedorController.buscarProveedores);

// HU 05: catalogo de zonas para el selector
router.get('/zonas', proveedorController.listarZonas);

// HU 06: catalogo de categorias para el filtro del listado
router.get('/categorias', proveedorController.listarCategorias);

// HU 06: perfil detallado (siempre al final: no tapa las rutas literales)
router.get('/:id', proveedorController.obtenerDetalle);

module.exports = router;
