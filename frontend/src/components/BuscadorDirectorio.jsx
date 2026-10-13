import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import ProveedorCard from './ProveedorCard';
import { buscarProveedores, listarCategorias, listarZonas } from '../services/proveedorService';

// HU 05: buscador por codigo postal o zona, integrado en la pagina principal.
// HU 06: tarjetas de resultados con orden basico por calificacion o
// categoria de servicio; el clic en una tarjeta abre el perfil detallado.
export default function BuscadorDirectorio() {
  const [modo, setModo] = useState('codigo_postal'); // 'codigo_postal' | 'zona'
  const [codigoPostal, setCodigoPostal] = useState('');
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [zonas, setZonas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [resultados, setResultados] = useState(null); // null = sin busqueda todavia
  const [zonaBuscada, setZonaBuscada] = useState('');
  const [orden, setOrden] = useState('calificacion'); // 'calificacion' | 'resenas' | 'nombre'
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([listarZonas(), listarCategorias()])
      .then(([z, c]) => {
        setZonas(z);
        setCategorias(c);
      })
      .catch(() => setError('No fue posible cargar los catalogos del buscador.'));
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
      setFiltroCategoria('todas');
    } catch (err) {
      setResultados(null);
      setError(err.response?.data?.error || 'No fue posible realizar la busqueda.');
    } finally {
      setCargando(false);
    }
  };

  // Orden y filtro basicos sobre los resultados ya cargados (HU 06).
  const visibles = useMemo(() => {
    if (!resultados) return [];
    let lista = [...resultados];
    if (filtroCategoria !== 'todas') {
      lista = lista.filter((p) => p.categorias.includes(filtroCategoria));
    }
    if (orden === 'calificacion') {
      lista.sort((a, b) => b.calificacion - a.calificacion || b.total_resenas - a.total_resenas);
    } else if (orden === 'resenas') {
      lista.sort((a, b) => b.total_resenas - a.total_resenas);
    } else if (orden === 'nombre') {
      lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }
    return lista;
  }, [resultados, filtroCategoria, orden]);

  return (
    <section id="buscador" className="max-w-4xl mx-auto mt-10 px-4">
      {/* Buscador (HU 05) */}
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

      {/* Resultados en tarjetas (HU 06) */}
      {resultados !== null && !cargando && (
        <div className="mt-6">
          {resultados.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-gray-500">
                  {resultados.length} proveedor{resultados.length !== 1 ? 'es' : ''} en {zonaBuscada}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    aria-label="Filtrar por categoria"
                    className="border border-gray-300 rounded-md p-2 text-sm bg-white outline-none focus:border-blue-500"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="todas">Todas las categorias</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.nombre}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Ordenar resultados"
                    className="border border-gray-300 rounded-md p-2 text-sm bg-white outline-none focus:border-blue-500"
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                  >
                    <option value="calificacion">Mejor calificacion</option>
                    <option value="resenas">Mas resenas</option>
                    <option value="nombre">Nombre (A-Z)</option>
                  </select>
                </div>
              </div>

              {visibles.length > 0 ? (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {visibles.map((prov) => (
                    <li key={prov.id}>
                      <ProveedorCard proveedor={prov} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
                  <p className="font-medium text-yellow-800">
                    No hay proveedores de {filtroCategoria} en {zonaBuscada}.
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Prueba con otra categoria u otra zona.
                  </p>
                </div>
              )}
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
