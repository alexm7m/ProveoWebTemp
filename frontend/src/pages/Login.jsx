// CODIGO DE LA RAMA MAIN
// import React, { useState } from 'react';
// import { useLocation, useNavigate, Link } from 'react-router-dom';
// import { Eye, EyeOff } from 'lucide-react';
// import api from '../services/api';

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [activeTab, setActiveTab] = useState(
//     location.state?.rol === 'proveedor' ? 'proveedor' : 'cliente'
//   );
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSubmitting(true);
//     try {
//       const response = await api.post('/auth/login', { ...formData, rol: activeTab });
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//       navigate(response.data.user.rol === 'proveedor' ? '/perfil' : '/');
//     } catch (error) {
//       setError(error.response?.data?.error || 'No fue posible iniciar sesión.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border">
//           <div className="text-center mb-6">
//             <h2 className="mt-2 text-2xl font-bold text-gray-900">Iniciar sesión</h2>
//             <p className="text-sm text-gray-500 mt-1">Ingresa a tu cuenta para gestionar tus servicios o solicitudes</p>
//           </div>

//           {location.state?.mensaje && <div role="status" className="p-4 mb-4 rounded bg-green-100 text-green-700">{location.state.mensaje}</div>}
//           {error && <div role="alert" className="p-4 mb-4 rounded bg-red-100 text-red-700">{error}</div>}

//           <div className="flex border-b mb-6">
//             <button type="button" onClick={() => setActiveTab('cliente')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'cliente' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
//               👤 Soy cliente
//             </button>
//             <button type="button" onClick={() => setActiveTab('proveedor')} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === 'proveedor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
//               🛠️ Soy proveedor de servicios
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
//               <input type="email" required autoComplete="email" className="mt-1 block w-full border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Contraseña</label>
//               <div className="relative mt-1">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   autoComplete="current-password"
//                   className="block w-full border border-gray-300 rounded-md p-2.5 pr-12 outline-none focus:border-blue-500"
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((visible) => !visible)}
//                   aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
//                   aria-pressed={showPassword}
//                   className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-blue-600"
//                 >
//                   {showPassword ? <EyeOff aria-hidden="true" size={20} /> : <Eye aria-hidden="true" size={20} />}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" disabled={submitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60">
//               {submitting ? 'Ingresando...' : 'Continuar'}
//             </button>
//           </form>

//           <div className="mt-6 text-center text-sm text-gray-500">
//             ¿No tienes cuenta? <Link to="/register" className="text-blue-600 font-medium hover:underline">Regístrate gratis aquí</Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { iniciarSesion } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { user } = await iniciarSesion(formData);
      navigate(user.role === 'proveedor' ? '/cuenta' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'No fue posible iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border">
          <div className="text-center mb-6">
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Iniciar sesión</h2>
            <p className="text-sm text-gray-500 mt-1">Ingresa a tu cuenta para continuar</p>
          </div>

          {error && (
            <div role="alert" className="p-4 mb-4 rounded bg-red-100 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  autoComplete="current-password"
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
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Ingresando...' : 'Continuar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Regístrate gratis aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
