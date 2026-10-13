const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

// HU 05: busqueda por codigo postal o zona
router.get('/buscar', proveedorController.buscarProveedores);

// HU 05: catalogo de zonas para el selector
router.get('/zonas', proveedorController.listarZonas);

module.exports = router;
