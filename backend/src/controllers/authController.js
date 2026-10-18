const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { normalizeMexicanPhone } = require('../utils/mexicanPhone');
const { validatePassword } = require('../utils/passwordPolicy');
const userRepository = require('../repositories/userRepository');

const ROLES_PERMITIDOS = ['cliente', 'proveedor'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LONGITUD_PASSWORD_MIN = 8;
const LONGITUD_PASSWORD_MAX = 72; // bcrypt solo considera los primeros 72 bytes
const BCRYPT_ROUNDS = 10;

// FROM MAIN
const publicUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  email: user.email,
  rol: user.rol,
});

// La tabla users (init.sql) no tiene columna de nombre: el correo hace de identificador.
const usuarioPublico = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
});

const crearToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET debe estar configurada para emitir tokens de sesión.');
  }

  return jwt.sign(
    { rol: user.rol },
    process.env.JWT_SECRET,
    { subject: user.id, expiresIn: '7d' }
  );
};

const registrar = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  const nombreNormalizado = typeof nombre === 'string' ? nombre.trim() : '';
  const emailNormalizado = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!nombreNormalizado || nombreNormalizado.length > 100) {
    return res.status(400).json({ error: 'El nombre es obligatorio y no debe superar 100 caracteres.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado) || emailNormalizado.length > 150) {
    return res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: 'La contraseña debe tener entre 10 y 18 caracteres e incluir al menos una mayúscula, un número y un símbolo.',
    });
  }
  if (typeof req.body.telefono !== 'string' || !normalizeMexicanPhone(req.body.telefono)) {
    return res.status(400).json({ error: 'Ingresa un teléfono mexicano válido de 10 dígitos, con o sin el prefijo +52.' });
  }
  const telefono = normalizeMexicanPhone(req.body.telefono);
  if (!['cliente', 'proveedor'].includes(rol)) {
    return res.status(400).json({ error: 'El tipo de cuenta debe ser cliente o proveedor.' });
  }

  try {
    const duplicate = await db.query(
      `SELECT
         EXISTS (SELECT 1 FROM usuarios WHERE lower(trim(email)) = $1) AS email_exists,
         EXISTS (SELECT 1 FROM usuarios WHERE telefono = $2) AS telefono_exists`,
      [emailNormalizado, telefono]
    );

    if (duplicate.rows[0].email_exists) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
    }
    if (duplicate.rows[0].telefono_exists) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese número de teléfono.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO usuarios (nombre, email, telefono, password_hash, rol)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, nombre, email, rol`,
        [nombreNormalizado, emailNormalizado, telefono, passwordHash, rol]
      );
      const registeredUser = result.rows[0];

      if (rol === 'proveedor') {
        await client.query(
          `INSERT INTO perfiles_proveedor (usuario_id, telefono)
           VALUES ($1, $2)`,
          [registeredUser.id, telefono]
        );
      }

      return registeredUser;
    });

    return res.status(201).json({
      mensaje: 'Registro exitoso. Inicia sesión para continuar.',
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'usuarios_email_unique_idx') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo electrónico.' });
    }
    if (error.code === '23505' && error.constraint === 'usuarios_telefono_unique_idx') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese número de teléfono.' });
    }
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ error: 'No fue posible completar el registro.' });
  }
};

const iniciarSesion = async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const { password, rol } = req.body;

  if (!email || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'El correo y la contraseña son obligatorios.' });
  }
  if (!['cliente', 'proveedor'].includes(rol)) {
    return res.status(400).json({ error: 'Selecciona si inicias sesión como cliente o proveedor.' });
  }

  try {
    const result = await db.query(
      `SELECT id, nombre, email, password_hash, rol, estatus
       FROM usuarios
       WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (
      !user ||
      user.estatus !== 'activo' ||
      user.rol !== rol ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.status(401).json({ error: 'Correo, contraseña o tipo de cuenta incorrectos.' });
    }

    return res.status(200).json({
      token: crearToken(user),
      user: publicUser(user),
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'No fue posible iniciar sesión.' });
  }
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
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'No fue posible iniciar sesión.' });
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

module.exports = { register, login, perfil, registrar, iniciarSesion };
