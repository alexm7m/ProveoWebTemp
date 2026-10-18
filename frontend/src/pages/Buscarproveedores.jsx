import React, { useState } from 'react';
import { buscarProveedoresCercanos, obtenerPerfilProveedor } from '../services/proveedorService';

const VistaBusqueda = () => {
  const [categoria, setCategoria] = useState('Plomería');
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setProveedorSeleccionado(null);
    try {
      const lat = 22.1565;
      const lng = -100.9792;
      const radio = 5000;
      const resultados = await buscarProveedoresCercanos(lat, lng, radio, categoria);
      setProveedores(resultados);
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setCargando(false);
    }
  };

  const verPerfil = async (id) => {
    setCargandoPerfil(true);
    try {
      const detalle = await obtenerPerfilProveedor(id);
      setProveedorSeleccionado(detalle);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setCargandoPerfil(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Proveo - Directorio Local</h1>
      <h2>Buscar Proveedores Cercanos</h2>

      {/* Formulario */}
      <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Categoría"
          style={{ padding: '8px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* Resultados de búsqueda */}
      <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
        {proveedores.map((prov) => (
          <div
            key={prov.id}
            style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{prov.nombre}</h3>
            <p style={{ margin: '4px 0', color: '#666' }}>Categoría: {prov.categoria}</p>
            <p style={{ margin: '4px 0' }}>⭐ Calificación: {prov.promedio_calificacion}</p>
            <p style={{ margin: '4px 0', color: '#28a745', fontWeight: 'bold' }}>
              📍 Distancia: {Math.round(prov.distancia_metros)} metros
            </p>
            <button
              onClick={() => verPerfil(prov.id)}
              style={{ marginTop: '10px', padding: '8px 14px', background: '#343a40', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Ver perfil completo
            </button>
          </div>
        ))}
      </div>

      {/* Detalle del Perfil y Reseñas */}
      {cargandoPerfil && <p style={{ color: '#007bff' }}>Cargando perfil...</p>}

      {proveedorSeleccionado && !cargandoPerfil && (
        <div style={{ borderTop: '2px solid #007bff', paddingTop: '20px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>{proveedorSeleccionado.nombre}</h2>
          <p style={{ fontStyle: 'italic', color: '#555' }}>{proveedorSeleccionado.descripcion}</p>
          <div style={{ margin: '15px 0' }}>
            <p style={{ margin: '4px 0' }}>📞 <strong>Teléfono:</strong> {proveedorSeleccionado.telefono || 'No disponible'}</p>
            <p style={{ margin: '4px 0' }}>📌 <strong>Dirección:</strong> {proveedorSeleccionado.direccion || 'No disponible'}</p>
            <p style={{ margin: '4px 0' }}>⭐ <strong>Calificación general:</strong> {proveedorSeleccionado.promedio_calificacion}</p>
          </div>

          <h3 style={{ marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Reseñas y opiniones</h3>
          {proveedorSeleccionado.resenas && proveedorSeleccionado.resenas.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {proveedorSeleccionado.resenas.map((r) => (
                <div key={r.id} style={{ background: '#fff', border: '1px solid #e9ecef', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong>{r.autor}</strong>
                    <span style={{ color: '#e0a800', fontWeight: 'bold' }}>⭐ {r.calificacion}/5</span>
                  </div>
                  <p style={{ margin: '4px 0', color: '#495057' }}>{r.comentario}</p>
                  <small style={{ color: '#888' }}>{new Date(r.fecha).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666' }}>No hay reseñas registradas aún.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VistaBusqueda;

