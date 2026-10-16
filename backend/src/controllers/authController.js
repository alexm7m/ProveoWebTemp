const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const ROLES_PERMITIDOS = ['cliente', 'proveedor'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGITUD_PASSWORD_MIN = 8;
const LONGITUD_PASSWORD_MAX = 72; // bcrypt solo considera los primeros 72 bytes
const BCRYPT_ROUNDS = 10;

// La tabla users (init.sql) no tiene columna de nombre: el correo hace de identificador.
const usuarioPublico = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
});

const crearToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET debe estar configurada para emitir tokens de sesion.');
  }

  return jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const { password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Correo, contrasena y tipo de cuenta son obligatorios' });
  }
  if (!EMAIL_REGEX.test(email) || email.length > 255) {
    return res.status(400).json({ error: 'Correo electronico invalido' });
  }
  if (typeof password !== 'string' || password.length < LONGITUD_PASSWORD_MIN) {
    return res.status(400).json({
      error: `La contrasena debe tener al menos ${LONGITUD_PASSWORD_MIN} caracteres`,
    });
  }
  if (password.length > LONGITUD_PASSWORD_MAX) {
    return res.status(400).json({
      error: `La contrasena no debe superar los ${LONGITUD_PASSWORD_MAX} caracteres`,
    });
  }
  if (!ROLES_PERMITIDOS.includes(role)) {
    return res.status(400).json({ error: 'Tipo de cuenta invalido' });
  }

  try {
    const existente = await userRepository.findByEmail(email);
    if (existente) {
      return res.status(409).json({ error: 'El correo ya esta registrado' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await userRepository.create({ email, passwordHash, role });

    return res.status(201).json({
      mensaje: 'Registro exitoso. Inicia sesion para continuar.',
      user: usuarioPublico(user),
    });
  } catch (err) {
    // Carrera entre el SELECT y el INSERT: el indice UNIQUE decide.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo ya esta registrado' });
    }
    console.error('Error al registrar usuario:', err);
    return res.status(500).json({ error: 'No fue posible completar el registro' });
  }
};

const login = async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contrasena son obligatorios' });
  }

  try {
    const user = await userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Correo o contrasena incorrectos' });
    }

    return res.status(200).json({
      token: crearToken(user),
      user: usuarioPublico(user),
    });
  } catch (err) {
    console.error('Error al iniciar sesion:', err);
    return res.status(500).json({ error: 'No fue posible iniciar sesion' });
  }
};

// GET /api/auth/perfil - requiere token valido
const perfil = async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ error: 'La sesion ya no es valida' });
    }

    return res.json({ user: usuarioPublico(user) });
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    return res.status(500).json({ error: 'No fue posible obtener el perfil' });
  }
};

module.exports = { register, login, perfil };
