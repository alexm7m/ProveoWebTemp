module.exports = (...rolesPermitidos) => (req, res, next) => {
  if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso.' });
  }
  return next();
};
