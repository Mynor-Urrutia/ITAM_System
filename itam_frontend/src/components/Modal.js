/**
 * Componente Modal reutilizable para el sistema ITAM.
 *
 * Proporciona una ventana modal responsive con diferentes tamaños,
 * overlay de fondo, botón de cierre y scroll interno para contenido largo.
 * Es utilizado en formularios, detalles y confirmaciones en toda la aplicación.
 *
 * Características principales:
 * - Overlay semi-transparente que bloquea interacción con fondo
 * - Tamaños configurables: sm, default, large, xl, 2xl
 * - Scroll interno automático para contenido largo
 * - Botón de cierre en header con accesibilidad
 * - Diseño responsive con TailwindCSS
 * - Animaciones suaves de entrada/salida
 */

import React from 'react';

/**
 * Componente Modal con overlay y contenido scrollable.
 *
 * @param {boolean} show - Controla la visibilidad del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} title - Título que se muestra en el header del modal
 * @param {ReactNode} children - Contenido del modal (formularios, detalles, etc.)
 * @param {string} size - Tamaño del modal: 'sm', 'default', 'large', 'xl', '2xl'
 */
function Modal({ show, onClose, title, children, size = 'default' }) {
  // Si no debe mostrarse, no renderiza nada
  if (!show) {
    return null;
  }

  // Clases CSS para diferentes tamaños de modal
  const sizeClasses = {
    sm: 'max-w-md',      // Pequeño
    default: 'max-w-lg', // Por defecto
    large: 'max-w-4xl',  // Grande
    xl: 'max-w-6xl',     // Extra grande
    '2xl': 'max-w-7xl'   // Extra extra grande
  };

  return (
    // Overlay de fondo semi-transparente
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Contenedor del modal con tamaño dinámico */}
      <div className={`bg-white rounded-lg shadow-xl relative ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col`}>
        {/* Header del modal con título y botón de cierre */}
        <div className="flex justify-between items-center p-6 pb-3 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none focus:outline-none"
            aria-label="Cerrar modal"
          >
            &times; {/* Símbolo de cerrar */}
          </button>
        </div>

        {/* Contenido del modal con scroll interno */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {children} {/* Renderiza el contenido pasado como children (formularios, detalles, etc.) */}
        </div>
      </div>
    </div>
  );
}

export default Modal;