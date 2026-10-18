import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Inicio from './pages/Inicio';
import PerfilProveedor from './pages/PerfilProveedor';
import ProfileEdit from './pages/ProfileEdit';
import { obtenerSesion } from './services/authService';

// Ruta privada: sin sesion se redirige al login
function RutaPrivada({ children }) {
  return obtenerSesion() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/proveedores/:id" element={<PerfilProveedor />} />
          <Route path="/perfil" element={<ProfileEdit />} />
          <Route
            path="/cuenta"
            element={
              <RutaPrivada>
                <div className="max-w-md mx-auto mt-12 p-8 border rounded-lg shadow-sm">
                  <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
                  <p className="text-sm text-gray-500 mt-2">
                    Sesión protegida: esta vista solo se muestra con un token JWT válido.
                  </p>
                </div>
              </RutaPrivada>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
