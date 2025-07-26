import React from 'react';

function UserDetail({ user, onClose }) {
  if (!user) {
    return <div className="text-center text-gray-500">No hay usuario seleccionado.</div>;
  }

  return (
    <div className="space-y-4 text-gray-700">
      <div>
        <p className="font-semibold text-gray-800">Usuario:</p>
        <p>{user.username}</p>
      </div>
      <div>
        <p className="font-semibold text-gray-800">Email:</p>
        <p>{user.email}</p>
      </div>
      <div>
        <p className="font-semibold text-gray-800">Nombre Completo:</p>
        <p>{user.first_name} {user.last_name}</p>
      </div>
      <div>
        <p className="font-semibold text-gray-800">Puesto:</p>
        <p>{user.puesto || 'N/A'}</p>
      </div>
      <div>
        <p className="font-semibold text-gray-800">Departamento:</p>
        {/* CAMBIADO: Usar user.departamento_name */}
        <p>{user.departamento_name || 'N/A'}</p>
      </div>
      <div>
        <p className="font-semibold text-gray-800">Región:</p>
        {/* CAMBIADO: Usar user.region_name */}
        <p>{user.region_name || 'N/A'}</p>
      </div>
      <div>
        <p className="font-semibold text-gray-800">Estado:</p>
        <p>{user.status || 'N/A'}</p>
      </div>
      {/* Puedes añadir más campos si los necesitas */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default UserDetail;