const router = require('express').Router();
const autenticar = require('../middlewares/auth');
const permitirRoles = require('../middlewares/roles');
const zs = require('../controllers/zonaServicioController');

router.get('/zona', zs.buscarPorZona);
router.get('/zonas', zs.listarZonas);
router.get('/servicios', autenticar, permitirRoles('proveedor'), zs.listarServicios);
router.post('/servicios', autenticar, permitirRoles('proveedor'), zs.crearServicio);
router.put('/servicios/:id', autenticar, permitirRoles('proveedor'), zs.actualizarServicio);
router.delete('/servicios/:id', autenticar, permitirRoles('proveedor'), zs.eliminarServicio);

module.exports = router;