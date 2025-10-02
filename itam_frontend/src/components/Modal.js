// src/components/Modal.js
import React from 'react';

function Modal({ show, onClose, title, children, size = 'default' }) {
  if (!show) {
    return null; // Si 'show' es falso, no renderiza nada
  }

  const sizeClasses = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    large: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl relative ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col`}>
        <div className="flex justify-between items-center p-6 pb-3 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none focus:outline-none"
          >
            &times; {/* Carácter de 'x' para cerrar */}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {children} {/* Aquí se renderizará el contenido del modal (formulario o detalles) */}
        </div>
      </div>
    </div>
  );
}

export default Modal;