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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Proveo - Directorio Local</h2>
      <h3>Buscar Proveedores Cercanos</h3>

      {/* Formulario de búsqueda */}
      <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Categoría"
          style={{ padding: '8px', flex: 1 }}
        />
        <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* Listado de resultados (HU 06) */}
      <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
        {proveedores.map((prov) => (
          <div
            key={prov.id}
            style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px', backgroundColor: '#fff' }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{prov.nombre}</h4>
            <p style={{ margin: '4px 0' }}>Categoría: {prov.categoria}</p>
            <p style={{ margin: '4px 0' }}>⭐ Calificación: {prov.promedio_calificacion}</p>
            <p style={{ margin: '4px 0', color: 'green', fontWeight: 'bold' }}>
              📍 Distancia: {Math.round(prov.distancia_metros)} metros
            </p>
            <button
              onClick={() => verPerfil(prov.id)}
              style={{ marginTop: '10px', padding: '6px 12px', cursor: 'pointer' }}
            >
              Ver perfil completo
            </button>
          </div>
        ))}
      </div>

      {/* Perfil detallado y Reseñas (HU 07) */}
      {cargandoPerfil && <p>Cargando información del perfil...</p>}

      {proveedorSeleccionado && !cargandoPerfil && (
        <div style={{ borderTop: '2px solid #333', paddingTop: '20px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{proveedorSeleccionado.nombre}</h3>
          <p style={{ fontStyle: 'italic', color: '#555' }}>{proveedorSeleccionado.descripcion}</p>
          <p>📞 <strong>Teléfono:</strong> {proveedorSeleccionado.telefono || 'No disponible'}</p>
          <p>📌 <strong>Dirección:</strong> {proveedorSeleccionado.direccion || 'No disponible'}</p>
          <p>⭐ <strong>Calificación general:</strong> {proveedorSeleccionado.promedio_calificacion}</p>

          <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Reseñas y opiniones</h4>
          {proveedorSeleccionado.resenas && proveedorSeleccionado.resenas.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {proveedorSeleccionado.resenas.map((r) => (
                <div key={r.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{r.autor}</strong>
                    <span style={{ color: '#d97706', fontWeight: 'bold' }}>⭐ {r.calificacion}/5</span>
                  </div>
                  <p style={{ margin: '6px 0', color: '#333' }}>{r.comentario}</p>
                  <small style={{ color: '#888' }}>{new Date(r.fecha).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay reseñas registradas aún.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VistaBusqueda;

