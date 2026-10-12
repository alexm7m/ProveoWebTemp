import api from './api';

// La sesion se guarda en localStorage: 'token' (lo adjunta api.js a cada peticion)
// y 'user' (para pintar la UI sin volver a consultar el backend).
// api.js limpia ambas claves si el backend responde 401.

export const obtenerSesion = () => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return { user: JSON.parse(user) };
  } catch {
    cerrarSesion();
    return null;
  }
};

export const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const guardarSesion = ({ token, user }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// POST /api/auth/register - no crea sesion; tras registrarse se va al login.
export const registrar = async (datos) => {
  const { data } = await api.post('/auth/register', datos);
  return data;
};

// POST /api/auth/login - guarda token y usuario devueltos por el backend.
export const iniciarSesion = async (credenciales) => {
  const { data } = await api.post('/auth/login', credenciales);
  guardarSesion(data);
  return data;
};

// GET /api/auth/perfil - ruta protegida: refresca el usuario con el token vigente.
export const obtenerPerfil = async () => {
  const { data } = await api.get('/auth/perfil');
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
};
