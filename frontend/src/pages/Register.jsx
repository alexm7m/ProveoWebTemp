import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { registrar } from '../services/authService';

const PASSWORD_MIN = 8;

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmar: '',
    role: 'cliente',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < PASSWORD_MIN) {
      setError(`La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`);
      return;
    }
    if (formData.password !== formData.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await registrar({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate('/login', { state: { mensaje: 'Cuenta creada. Inicia sesión para continuar.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'No fue posible completar el registro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border">
          <div className="text-center mb-6">
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Crear cuenta</h2>
            <p className="text-sm text-gray-500 mt-1">Regístrate como cliente o proveedor</p>
          </div>

          {error && (
            <div role="alert" className="p-4 mb-4 rounded bg-red-100 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de cuenta
              </span>
              <div className="flex border-b">
                {[
                  { valor: 'cliente', etiqueta: '👤 Soy cliente' },
                  { valor: 'proveedor', etiqueta: '🛠️ Soy proveedor' },
                ].map((opcion) => (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: opcion.valor })}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                      formData.role === opcion.valor
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {opcion.etiqueta}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={PASSWORD_MIN}
                  autoComplete="new-password"
                  className="block w-full border border-gray-300 rounded-md p-2.5 pr-12 outline-none focus:border-blue-500"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Mínimo {PASSWORD_MIN} caracteres.</p>
            </div>

            <div>
              <label htmlFor="confirmar" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmar"
                name="confirmar"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={PASSWORD_MIN}
                autoComplete="new-password"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500"
                value={formData.confirmar}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
