// C:\Proyectos\ITAM_System\itam_frontend\src\components\Sidebar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext'; // Importa useAuth para hasPermission
import {
    faHome,         // Icono para Home
    faUserCog,      // Gestión de Usuarios
    faCog,          // Icono para el dropdown de Configuraciones
    faInfoCircle,   // Acerca de
    faEnvelope,     // Contacto
    faChartBar,     // Reportes
    faCogs,         // Mantenimiento de Activos
    faUsers,        // Gestión de Roles (o un icono más específico si lo encuentras)
    faChevronDown,  // Para el dropdown
    faChevronUp     // Para el dropdown
} from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    // Get user and hasPermission from AuthContext
    const { user, hasPermission } = useAuth(); 

    // Determine if the settings dropdown should be visible at all
    // It should be visible if the user has permission to view users OR view groups.
    const canViewSettings = hasPermission('users.view_customuser') || hasPermission('auth.view_group');

    return (
        <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
            <div className="text-white flex items-center px-4">
                <img src="/path/to/your/logo.png" alt="Logo" className="h-8 w-8 mr-2" /> {/* Agrega la ruta de tu logo */}
                <span className="text-2xl font-extrabold">ITAM System</span>
            </div>

            <nav>
                <NavLink
                    to="/home"
                    className={({ isActive }) =>
                        `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white ${
                            isActive ? 'bg-gray-700 text-white' : ''
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faHome} className="mr-3" />
                    Home
                </NavLink>

                {/* --- Dropdown de Configuraciones --- */}
                {/* Only show the settings dropdown button if the user has any relevant permission */}
                {canViewSettings && (
                    <div className="relative">
                        <button
                            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                            className="w-full text-left flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white focus:outline-none"
                        >
                            <FontAwesomeIcon icon={faCog} className="mr-3" />
                            Configuraciones
                            <span className="ml-auto">
                                <FontAwesomeIcon icon={showSettingsDropdown ? faChevronUp : faChevronDown} />
                            </span>
                        </button>
                        {showSettingsDropdown && (
                            <div className="ml-6 mt-1 bg-gray-700 rounded-md shadow-lg">
                                {/* Only show 'Gestión de Usuarios' if user has 'users.view_customuser' permission */}
                                {hasPermission('users.view_customuser') && (
                                    <NavLink
                                        to="/users"
                                        className={({ isActive }) =>
                                            `block py-2 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                        onClick={() => setShowSettingsDropdown(false)}
                                    >
                                        <FontAwesomeIcon icon={faUserCog} className="mr-3" />
                                        Gestión de Usuarios
                                    </NavLink>
                                )}
                                {/* Only show 'Gestión de Roles' if user has 'auth.view_group' permission */}
                                {hasPermission('auth.view_group') && (
                                    <NavLink
                                        to="/roles-management"
                                        className={({ isActive }) =>
                                            `block py-2 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                        onClick={() => setShowSettingsDropdown(false)}
                                    >
                                        <FontAwesomeIcon icon={faUsers} className="mr-3" />
                                        Gestión de Roles
                                    </NavLink>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {/* --- Fin del Dropdown de Configuraciones --- */}

                {/* Otros enlaces con iconos */}
                {hasPermission('reports.view_report') && ( // Asumiendo este permiso
                    <NavLink
                        to="/reports"
                        className={({ isActive }) =>
                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white ${
                                isActive ? 'bg-gray-700 text-white' : ''
                            }`
                        }
                    >
                        <FontAwesomeIcon icon={faChartBar} className="mr-3" />
                        Reportes
                    </NavLink>
                )}
                {hasPermission('assets.view_asset') && ( // Asumiendo este permiso
                    <NavLink
                        to="/assets"
                        className={({ isActive }) =>
                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white ${
                                isActive ? 'bg-gray-700 text-white' : ''
                            }`
                        }
                    >
                        <FontAwesomeIcon icon={faCogs} className="mr-3" />
                        Mantenimiento de Activos
                    </NavLink>
                )}
                <NavLink
                    to="/about"
                    className={({ isActive }) =>
                        `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white ${
                            isActive ? 'bg-gray-700 text-white' : ''
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-3" />
                    Acerca de
                </NavLink>
                <NavLink
                    to="/contact"
                    className={({ isActive }) =>
                        `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white ${
                            isActive ? 'bg-gray-700 text-white' : ''
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faEnvelope} className="mr-3" />
                    Contacto
                </NavLink>
            </nav>
        </div>
    );
}

export default Sidebar;