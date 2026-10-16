import React from 'react';
import { Star } from 'lucide-react';

// Calificacion promedio en estrellas (1 a 5) con su total de resenas.
// Con mostrarTexto={false} solo pinta las estrellas (util para una resena
// individual, donde el "de 5 (N resenas)" no tiene sentido).
export default function Estrellas({ calificacion, totalResenas, size = 16, mostrarTexto = true }) {
  const promedio = Number(calificacion) || 0;
  const llenas = Math.round(promedio);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= llenas ? 'text-yellow-400' : 'text-gray-300'}
            fill={n <= llenas ? 'currentColor' : 'none'}
            strokeWidth={2}
          />
        ))}
      </span>
      {mostrarTexto && (
        <span className="text-sm text-gray-600">
          {promedio > 0
            ? `${promedio.toFixed(1)} de 5 (${totalResenas} reseña${totalResenas !== 1 ? 's' : ''})`
            : 'Sin reseñas'}
        </span>
      )}
    </span>
  );
}
