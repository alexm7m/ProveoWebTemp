import React from 'react';
import { Link } from 'react-router-dom';
import { obtenerSesion } from '../services/authService';

export default function Inicio() {
  const sesion = obtenerSesion();

  return (
    <div className="max-w-3xl mx-auto mt-16 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900">Bienvenido a Proveo</h1>
      <p className="mt-4 text-gray-600">
        Encuentra proveedores de servicios cerca de ti o publica tus propios servicios.
      </p>

      {sesion ? (
        <p className="mt-8 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md py-3">
          Sesión activa como <strong>{sesion.user.email}</strong> ({sesion.user.role}).
        </p>
      ) : (
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Crear cuenta
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-md text-sm font-medium text-blue-600 border border-blue-600 hover:bg-blue-50"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </div>
  );
}
