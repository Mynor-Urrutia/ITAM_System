// src/components/Modal.js
import React from 'react';

function Modal({ show, onClose, title, children, size = 'default' }) {
  if (!show) {
    return null; // Si 'show' es falso, no renderiza nada
  }

  const sizeClasses = {
    default: 'max-w-lg',
    large: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white p-6 rounded-lg shadow-xl relative ${sizeClasses[size]} w-full mx-4`}>
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none focus:outline-none"
          >
            &times; {/* Carácter de 'x' para cerrar */}
          </button>
        </div>
        <div className="py-4">
          {children} {/* Aquí se renderizará el contenido del modal (formulario o detalles) */}
        </div>
        {/* Opcional: Pie de página del modal si es necesario */}
        {/* <div className="pt-3 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cerrar</button>
        </div> */}
      </div>
    </div>
  );
}

export default Modal;