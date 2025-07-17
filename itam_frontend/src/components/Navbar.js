// src/components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Importa los componentes de Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faBriefcase, faBuilding } from '@fortawesome/free-solid-svg-icons'; // Iconos a usar

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
      <div className="text-xl font-bold">
        ITAM System
      </div>
      <div className="flex items-center space-x-6"> {/* Aumentado el espacio entre elementos */}
        {user && (
          <div className="text-sm text-right flex items-center space-x-4"> {/* Contenedor para info de usuario */}
            <div className="flex flex-col">
              <p className="font-semibold">{user.username}</p>
              {/* Puesto y Departamento en la misma línea */}
              <p className="text-xs text-gray-300">
                <FontAwesomeIcon icon={faBriefcase} className="mr-1" />
                {user.puesto || 'N/A'} &bull; <FontAwesomeIcon icon={faBuilding} className="mr-1" />
                {user.departamento || 'N/A'}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> {/* Icono de cerrar sesión */}
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;