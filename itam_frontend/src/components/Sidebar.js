// src/components/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Importa los componentes de Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCog, faUsers, faChevronDown } from '@fortawesome/free-solid-svg-icons'; // Iconos a usar

function Sidebar() {
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col p-4 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Menú</h2>
      <nav className="flex-1">
        <ul>
          <li className="mb-2">
            <Link
              to="/home"
              className="flex items-center p-3 rounded-md hover:bg-gray-700 transition duration-150"
            >
              <FontAwesomeIcon icon={faHome} className="mr-3 text-lg" /> {/* Icono de Home */}
              Página Principal
            </Link>
          </li>
          <li className="mb-2 relative">
            <button
              onClick={() => setShowConfigDropdown(!showConfigDropdown)}
              className="flex justify-between items-center w-full p-3 rounded-md hover:bg-gray-700 transition duration-150 focus:outline-none"
            >
              <span className="flex items-center">
                <FontAwesomeIcon icon={faCog} className="mr-3 text-lg" /> {/* Icono de Engranaje */}
                Configuraciones
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`w-4 h-4 transform transition-transform duration-200 ${showConfigDropdown ? 'rotate-180' : ''}`}
              />
            </button>
            {showConfigDropdown && (
              <ul className="pl-4 mt-1 space-y-1">
                <li>
                  <Link
                    to="/users"
                    className="flex items-center p-2 rounded-md hover:bg-gray-700 text-sm transition duration-150"
                    onClick={() => setShowConfigDropdown(false)}
                  >
                    <FontAwesomeIcon icon={faUsers} className="mr-2" /> {/* Icono de Usuarios */}
                    Gestión de Usuarios
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;