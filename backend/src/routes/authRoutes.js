const router = require('express').Router();
const { register, login, perfil } = require('../controllers/authController');
const verificarToken = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);

// Ruta protegida: valida que el middleware de autenticacion funcione
router.get('/perfil', verificarToken, perfil);

module.exports = router;
