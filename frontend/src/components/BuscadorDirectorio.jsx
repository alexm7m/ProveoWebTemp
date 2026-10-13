import React, { useEffect, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { buscarProveedores, listarZonas } from '../services/proveedorService';

// HU 05: buscador por codigo postal o zona integrado en la pagina principal.
export default function BuscadorDirectorio() {
  const [modo, setModo] = useState('codigo_postal'); // 'codigo_postal' | 'zona'
  const [codigoPostal, setCodigoPostal] = useState('');
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [zonas, setZonas] = useState([]);
  const [resultados, setResultados] = useState(null); // null = sin busqueda todavia
  const [zonaBuscada, setZonaBuscada] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listarZonas()
      .then((datos) => setZonas(datos))
      .catch(() => setError('No fue posible cargar el listado de zonas.'));
  }, []);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setError('');

    const cp = codigoPostal.trim();
    if (modo === 'codigo_postal' && !/^\d{5}$/.test(cp)) {
      setError('El codigo postal debe tener 5 digitos.');
      return;
    }
    if (modo === 'zona' && !zonaSeleccionada) {
      setError('Selecciona una zona del listado.');
      return;
    }

    setCargando(true);
    setResultados([]);
    try {
      const proveedores = await buscarProveedores(
        modo === 'codigo_postal' ? { codigoPostal: cp } : { zona: zonaSeleccionada }
      );
      setResultados(proveedores);
      setZonaBuscada(modo === 'codigo_postal' ? `codigo postal ${cp}` : zonaSeleccionada);
    } catch (err) {
      setResultados(null);
      setError(err.response?.data?.error || 'No fue posible realizar la busqueda.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <section id="buscador" className="max-w-3xl mx-auto mt-10 px-4">
      {/* Buscador */}
      <div className="bg-white p-6 shadow sm:rounded-lg border">
        <div className="flex border-b">
          {[
            { valor: 'codigo_postal', etiqueta: '📍 Codigo postal' },
            { valor: 'zona', etiqueta: '🗺️ Seleccionar zona' },
          ].map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => setModo(opcion.valor)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                modo === opcion.valor
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>

        <form onSubmit={handleBuscar} className="mt-6 flex flex-col sm:flex-row gap-3">
          {modo === 'codigo_postal' ? (
            <input
              id="codigo_postal"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="Ej. 78433"
              className="flex-1 border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500"
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, ''))}
            />
          ) : (
            <select
              id="zona"
              className="flex-1 border border-gray-300 rounded-md p-2.5 outline-none focus:border-blue-500 bg-white"
              value={zonaSeleccionada}
              onChange={(e) => setZonaSeleccionada(e.target.value)}
            >
              <option value="">Selecciona una zona...</option>
              {zonas.map((z) => (
                <option key={`${z.colonia}-${z.codigo_postal}`} value={z.colonia}>
                  {z.colonia} ({z.codigo_postal}){z.ciudad ? ` - ${z.ciudad}` : ''}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={cargando}
            className="flex justify-center items-center gap-2 py-2.5 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            <Search size={16} />
            {cargando ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {error && (
        <div role="alert" className="mt-6 p-4 rounded bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {/* Resultados */}
      {resultados !== null && !cargando && (
        <div className="mt-6">
          {resultados.length > 0 ? (
            <>
              <p className="text-sm text-gray-500">
                {resultados.length} proveedor{resultados.length !== 1 ? 'es' : ''} en {zonaBuscada}
              </p>
              <ul className="mt-4 space-y-3">
                {resultados.map((prov) => (
                  <li
                    key={prov.id}
                    className="bg-white border rounded-lg shadow-sm p-5 flex items-start gap-4"
                  >
                    {prov.foto_perfil_url ? (
                      <img
                        src={prov.foto_perfil_url}
                        alt={prov.nombre}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
                        {prov.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">{prov.nombre}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={14} />
                        {prov.colonia ? `${prov.colonia}, ` : ''}
                        CP {prov.codigo_postal || 's/o'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
              <p className="font-medium text-blue-800">
                No hay proveedores registrados en {zonaBuscada}.
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Prueba con otra zona o codigo postal.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
