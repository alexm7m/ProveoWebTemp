import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import Estrellas from '../components/Estrellas';
import { obtenerProveedor, obtenerResenas } from '../services/proveedorService';

// Perfil detallado del proveedor: destino del clic en una tarjeta (HU 06).
export default function PerfilProveedor() {
  const { id } = useParams();
  const [proveedor, setProveedor] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError('');
    setResenas([]);
    obtenerProveedor(id)
      .then((datos) => activo && setProveedor(datos))
      .catch((err) =>
        activo &&
        setError(
          err.response?.status === 404
            ? 'No encontramos ese proveedor.'
            : 'No fue posible cargar el perfil del proveedor.'
        )
      )
      .finally(() => activo && setCargando(false));

    // HU 07: las resenas las sirve el endpoint /v1 de Fabian; si su PR aun no
    // esta en develop, obtenerResenas devuelve [] y la pagina no se rompe.
    obtenerResenas(id).then((lista) => activo && setResenas(lista));

    return () => {
      activo = false;
    };
  }, [id]);

  const volver = (
    <Link
      to="/#buscador"
      className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline"
    >
      <ArrowLeft size={16} />
      Volver al buscador
    </Link>
  );

  if (cargando) {
    return (
      <p className="text-center mt-16 text-gray-500" role="status">
        Cargando perfil...
      </p>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 px-4">
        <div className="bg-white p-8 border rounded-lg shadow-sm text-center">
          <p className="text-gray-700">{error}</p>
          <div className="mt-4">{volver}</div>
        </div>
      </div>
    );
  }

  if (!proveedor) return null;

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4 pb-16">
      {volver}

      <div className="bg-white mt-4 p-8 shadow sm:rounded-lg border">
        <div className="flex items-start gap-5">
          {proveedor.foto_perfil_url ? (
            <img
              src={proveedor.foto_perfil_url}
              alt={proveedor.nombre}
              className="w-20 h-20 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-bold shrink-0">
              {proveedor.nombre.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{proveedor.nombre}</h1>
            {proveedor.titulo_profesional && (
              <p className="text-sm text-gray-500 mt-0.5">{proveedor.titulo_profesional}</p>
            )}
            <p className="mt-2 text-sm text-blue-700 bg-blue-50 inline-block rounded px-2 py-0.5">
              {proveedor.categorias}
            </p>
            <div className="mt-2">
              <Estrellas
                calificacion={proveedor.calificacion}
                totalResenas={proveedor.total_resenas}
                size={18}
              />
            </div>
          </div>
        </div>

        <dl className="mt-6 grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400" />
            {proveedor.colonia ? `${proveedor.colonia}, ` : ''}CP {proveedor.codigo_postal || 's/o'}
          </div>
          {proveedor.telefono && (
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              {proveedor.telefono}
            </div>
          )}
        </dl>

        {proveedor.descripcion && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-900">Acerca de</h2>
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
              {proveedor.descripcion}
            </p>
          </div>
        )}

        {proveedor.formacion && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-900">Formacion</h2>
            <p className="mt-2 text-sm text-gray-600">{proveedor.formacion}</p>
          </div>
        )}

        {/* HU 07: resenas servidas por el endpoint /v1 de Fabian (si existe). */}
        {resenas.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-900">
              Reseñas ({resenas.length})
            </h2>
            <ul className="mt-3 space-y-3">
              {resenas.map((r) => (
                <li key={r.id} className="border rounded-md p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      {r.autor || 'Cliente'}
                    </span>
                    <Estrellas calificacion={r.calificacion} size={14} mostrarTexto={false} />
                  </div>
                  {r.comentario && (
                    <p className="mt-1 text-sm text-gray-600">{r.comentario}</p>
                  )}
                  {r.fecha && (
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(r.fecha).toLocaleDateString('es-MX')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
