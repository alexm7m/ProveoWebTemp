const router = require('express').Router();
const { register, login, perfil, registrar, iniciarSesion } = require('../controllers/authController');
const verificarToken = require('../middlewares/auth');

router.post('/registro', registrar);
//router.post('/login', iniciarSesion);

router.post('/register', register);
router.post('/login', login);

// Ruta protegida: valida que el middleware de autenticacion funcione
router.get('/perfil', verificarToken, perfil);

module.exports = router;
