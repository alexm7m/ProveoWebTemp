const jwt = require('jsonwebtoken');

// Middleware de autenticacion: valida el header "Authorization: Bearer <token>".
// El token lo emite authController.crearToken con payload { role } y subject = id.
module.exports = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Se requiere iniciar sesión.' });
  }
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET no está configurada.');
    return res.status(500).json({ error: 'La autenticación no está configurada en el servidor.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.sub || !payload.role) {
      return res.status(401).json({ error: 'El token de sesion no es valido.' });
    }
    // req.user: id siempre como numero y el rol con el que se firmo el token.
    req.user = { id: Number(payload.sub), role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'La sesion no es valida o ha expirado.' });
  }
};