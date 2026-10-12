import React from 'react';
import VistaBusqueda from './pages/Buscarproveedores';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-600 max-w-4xl mx-auto">
          Proveo - Directorio Local
        </h1>
      </header>
      <main>
        <VistaBusqueda />
      </main>
    </div>
  );
}

export default App;
