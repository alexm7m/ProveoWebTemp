import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cerrarSesion, obtenerSesion } from '../services/authService';

export default function Navbar() {
  const navigate = useNavigate();
  // Se reevalua en cada render: cualquier navegacion (login, logout) la refresca.
  const sesion = obtenerSesion();

  const salir = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">
          Proveo
        </Link>

        <div className="flex items-center gap-4">
          {sesion ? (
            <>
              <Link to="/cuenta" className="text-sm text-gray-700 hover:text-blue-600">
                Hola, {sesion.user.email}
              </Link>
              <button
                onClick={salir}
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
              >
                Registrarme
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
