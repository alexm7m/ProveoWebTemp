import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Estrellas from './Estrellas';

// Tarjeta de resultado del directorio (HU 06): muestra nombre, categoria,
// zona y calificacion; al hacer clic abre el perfil detallado del proveedor.
export default function ProveedorCard({ proveedor }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/proveedores/${proveedor.id}`)}
      className="text-left w-full bg-white border rounded-lg shadow-sm p-5 hover:shadow-md hover:border-blue-300 transition-shadow"
    >
      <div className="flex items-start gap-4">
        {proveedor.foto_perfil_url ? (
          <img
            src={proveedor.foto_perfil_url}
            alt={proveedor.nombre}
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold shrink-0">
            {proveedor.nombre.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">{proveedor.nombre}</h3>
          <p className="mt-1 text-sm text-blue-700 bg-blue-50 inline-block rounded px-2 py-0.5">
            {proveedor.categorias}
          </p>
          <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
            <MapPin size={14} />
            {proveedor.colonia ? `${proveedor.colonia}, ` : ''}CP {proveedor.codigo_postal || 's/o'}
          </p>
          <div className="mt-2">
            <Estrellas calificacion={proveedor.calificacion} totalResenas={proveedor.total_resenas} />
          </div>
        </div>
      </div>
    </button>
  );
}
