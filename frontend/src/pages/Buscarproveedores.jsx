import React, { useState } from 'react';
import { buscarProveedoresCercanos } from '../services/proveedorService';

const VistaBusqueda = () => {
  const [categoria, setCategoria] = useState('Plomería');
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const lat = 22.1565;
      const lng = -100.9792;
      const radio = 5000;

      const resultados = await buscarProveedoresCercanos(lat, lng, radio, categoria);
      setProveedores(resultados);
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Buscar Proveedores Cercanos</h2>
      
      <form onSubmit={handleBuscar} className="flex gap-4 mb-6">
        <input 
          type="text" 
          value={categoria} 
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Categoría (ej. Plomería)" 
          className="border p-2 rounded flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proveedores.map((prov) => (
          <div key={prov.id} className="border p-4 rounded-lg shadow-sm bg-white">
            <h3 className="font-bold text-lg text-blue-600">{prov.nombre}</h3>
            <p className="text-gray-600">Categoría: {prov.categoria}</p>
            <p className="text-gray-600">⭐ Calificación: {prov.promedio_calificacion}</p>
            <p className="text-sm text-green-600 font-semibold mt-2">
              📍 Distancia: {Math.round(prov.distancia_metros)} metros
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VistaBusqueda;