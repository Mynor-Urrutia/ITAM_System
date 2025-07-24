// C:\Proyectos\ITAM_System\itam_frontend\src\components\Sidebar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext';
import {
    faHome,
    faUserCog,
    faCog,
    faInfoCircle,
    faEnvelope,
    faChartBar,
    faCogs,
    faUsers,
    faChevronDown,
    faChevronUp,
    faDatabase,
    faMapMarkedAlt,
    faHouseDamage,
    faBuilding,
    faVectorSquare,
} from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [showMasterDataDropdown, setShowMasterDataDropdown] = useState(false);

    const { user, hasPermission } = useAuth();

    const canViewSettings = hasPermission('users.view_customuser') || hasPermission('auth.view_group');

    // ACTUALIZADO: Usando 'masterdata' como app_label
    const canViewMasterData =
        hasPermission('masterdata.view_region') ||
        hasPermission('masterdata.view_finca') ||
        hasPermission('masterdata.view_departamento') ||
        hasPermission('masterdata.view_area');

    return (
        <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
            <div className="text-white flex items-center px-4">
                <img src="/path/to/your/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
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

                {/* --- NUEVO: Dropdown de Datos Maestros --- */}
                {canViewMasterData && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMasterDataDropdown(!showMasterDataDropdown)}
                            className="w-full text-left flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white focus:outline-none"
                        >
                            <FontAwesomeIcon icon={faDatabase} className="mr-3" />
                            Datos Maestros
                            <span className="ml-auto">
                                <FontAwesomeIcon icon={showMasterDataDropdown ? faChevronUp : faChevronDown} />
                            </span>
                        </button>
                        {showMasterDataDropdown && (
                            <div className="ml-6 mt-1 bg-gray-700 rounded-md shadow-lg">
                                {hasPermission('masterdata.view_region') && ( // ACTUALIZADO
                                    <NavLink
                                        to="/masterdata/regions"
                                        className={({ isActive }) =>
                                            `block py-2 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                        onClick={() => setShowMasterDataDropdown(false)}
                                    >
                                        <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-3" />
                                        Gestión de Regiones
                                    </NavLink>
                                )}
                                {hasPermission('masterdata.view_finca') && ( // ACTUALIZADO
                                    <NavLink
                                        to="/masterdata/farms"
                                        className={({ isActive }) =>
                                            `block py-2 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                        onClick={() => setShowMasterDataDropdown(false)}
                                    >
                                        <FontAwesomeIcon icon={faHouseDamage} className="mr-3" />
                                        Gestión de Fincas
                                    </NavLink>
                                )}
                                {hasPermission('masterdata.view_departamento') && ( // ACTUALIZADO
                                    <NavLink
                                        to="/masterdata/departments"
                                        className={({ isActive }) =>
                                            `block py-2 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                        onClick={() => setShowMasterDataDropdown(false)}
                                    >
                                        <FontAwesomeIcon icon={faBuilding} className="mr-3" />
                                        Gestión de Departamentos
                                    </NavLink>
                                )}
                                {hasPermission('masterdata.view_area') && ( // ACTUALIZADO
                                    <NavLink
                                        to="/masterdata/areas"
                                        className={({ isActive }) =>
                                            `block py-2 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                        onClick={() => setShowMasterDataDropdown(false)}
                                    >
                                        <FontAwesomeIcon icon={faVectorSquare} className="mr-3" />
                                        Gestión de Áreas
                                    </NavLink>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {/* --- Fin del Dropdown de Datos Maestros --- */}

                {/* Otros enlaces con iconos */}
                {hasPermission('reports.view_report') && (
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
                {hasPermission('assets.view_asset') && (
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