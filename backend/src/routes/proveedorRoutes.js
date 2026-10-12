const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

// 1. Ruta para búsqueda geoespacial (HU 06)
router.get('/buscar', proveedorController.buscarProveedores);

// 2. Ruta para obtener perfil público y reseñas por ID (HU 07)
router.get('/:id', proveedorController.obtenerDetallePerfil);

module.exports = router;

