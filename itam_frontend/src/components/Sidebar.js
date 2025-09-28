import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthContext';
import {
    faHome,
    faUser,
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
    faCube,
    faTags,
    faLaptop,
    faHistory,
    faTruck,
} from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [showMasterDataDropdown, setShowMasterDataDropdown] = useState(false);

    const { hasPermission } = useAuth(); // No necesitas 'user' aquí si no lo usas

    const canViewSettings = hasPermission('users.view_customuser') || hasPermission('auth.view_group');

    const canViewMasterData =
        hasPermission('masterdata.view_region') ||
        hasPermission('masterdata.view_finca') ||
        hasPermission('masterdata.view_departamento') ||
        hasPermission('masterdata.view_area') ||
        hasPermission('masterdata.view_tipoactivo') ||
        hasPermission('masterdata.view_marca') ||
        hasPermission('masterdata.view_modeloactivo') ||
        hasPermission('masterdata.view_proveedor') ||
        hasPermission('masterdata.view_auditlog');

    const canViewAssets = hasPermission('assets.view_activo');


    return (
        <div className="flex flex-col w-64 bg-gray-800 text-white min-h-screen">
            <div className="flex items-center justify-center h-16 shadow-md">
                <span className="text-xl font-bold uppercase tracking-wider">ITAM System</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {/* Home */}
                <NavLink
                    to="/home"
                    className={({ isActive }) =>
                        `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white ${
                            isActive ? 'bg-gray-700 text-white' : ''
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faHome} className="mr-3" />
                    Inicio
                </NavLink>

                {/* User Profile */}
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white ${
                            isActive ? 'bg-gray-700 text-white' : ''
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faUser} className="mr-3" />
                    Mi Perfil
                </NavLink>
                
                {/* --------------------------- */}
                {/* Menú Desplegable: DATOS MAESTROS */}
                {/* --------------------------- */}
                {canViewMasterData && (
                    <div className="space-y-1">
                        <button
                            onClick={() => setShowMasterDataDropdown(!showMasterDataDropdown)}
                            className="flex justify-between items-center w-full py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white focus:outline-none"
                        >
                            <span className="flex items-center">
                                <FontAwesomeIcon icon={faDatabase} className="mr-3" />
                                Datos Maestros
                            </span>
                            <FontAwesomeIcon icon={showMasterDataDropdown ? faChevronUp : faChevronDown} />
                        </button>
                        {showMasterDataDropdown && (
                            <div className="pl-6 space-y-1 text-sm bg-gray-700 rounded">
                                {hasPermission('masterdata.view_region') && (
                                    <NavLink
                                        to="/masterdata/regions"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-3" />
                                        Regiones
                                    </NavLink>
                                )}
                                {hasPermission('masterdata.view_finca') && (
                                    <NavLink
                                        to="/masterdata/farms"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faHouseDamage} className="mr-3" />
                                        Fincas
                                    </NavLink>
                                )}
                                {hasPermission('masterdata.view_departamento') && (
                                    <NavLink
                                        to="/masterdata/departments"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faBuilding} className="mr-3" />
                                        Departamentos
                                    </NavLink>
                                )}
                                {hasPermission('masterdata.view_area') && (
                                    <NavLink
                                        to="/masterdata/areas"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faVectorSquare} className="mr-3" />
                                        Áreas
                                    </NavLink>
                                )}
                                {hasPermission('masterdata.view_tipoactivo') && (
                                    <NavLink
                                        to="/masterdata/tipo-activos"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faCube} className="mr-3" />
                                        Tipos de Activos
                                    </NavLink>
                                )}
                                {hasPermission('masterdata.view_marca') && (
                                    <NavLink
                                        to="/masterdata/marcas"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faTags} className="mr-3" />
                                        Marcas
                                    </NavLink>
                                )}
                                
                                {hasPermission('masterdata.view_modeloactivo') && (
                                    <NavLink
                                        to="/masterdata/modelos-activo"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faLaptop} className="mr-3" />
                                        Modelos de Activo
                                    </NavLink>
                                )}
                                {hasPermission('masterdata.view_proveedor') && (
                                    <NavLink
                                        to="/masterdata/proveedores"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faTruck} className="mr-3" />
                                        Proveedores
                                    </NavLink>
                                )}
                                {hasPermission('masterdata.view_auditlog') && (
                                    <NavLink
                                        to="/masterdata/audit-logs"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faHistory} className="mr-3" />
                                        Registros de Auditoría
                                    </NavLink>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* --------------------------- */}
                {/* Gestión de Activos */}
                {canViewAssets && (
                    <NavLink
                        to="/assets/activos"
                        className={({ isActive }) =>
                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white ${
                                isActive ? 'bg-gray-700 text-white' : ''
                            }`
                        }
                    >
                        <FontAwesomeIcon icon={faLaptop} className="mr-3" />
                        Gestión de Activos
                    </NavLink>
                )}

                {/* --------------------------- */}
                {/* Menú Desplegable: AJUSTES (Usuarios y Roles) */}
                {/* --------------------------- */}
                {canViewSettings && (
                    <div className="space-y-1">
                        <button
                            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                            className="flex justify-between items-center w-full py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white focus:outline-none"
                        >
                            <span className="flex items-center">
                                <FontAwesomeIcon icon={faCog} className="mr-3" />
                                Configuración
                            </span>
                            <FontAwesomeIcon icon={showSettingsDropdown ? faChevronUp : faChevronDown} />
                        </button>
                        {showSettingsDropdown && (
                            <div className="pl-6 space-y-1 text-sm bg-gray-700 rounded">
                                {hasPermission('users.view_customuser') && (
                                    <NavLink
                                        to="/admin/users"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faUsers} className="mr-3" />
                                        Usuarios
                                    </NavLink>
                                )}
                                {hasPermission('auth.view_group') && (
                                    <NavLink
                                        to="/admin/roles"
                                        className={({ isActive }) =>
                                            `block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-600 hover:text-white ${
                                                isActive ? 'bg-gray-600 text-white' : ''
                                            }`
                                        }
                                    >
                                        <FontAwesomeIcon icon={faUserCog} className="mr-3" />
                                        Roles y Permisos
                                    </NavLink>
                                )}
                            </div>
                        )}
                    </div>
                )}


                {/* Otras Secciones */}
                {hasPermission('assets.view_activo') && ( // Asume que este permiso aplica a la vista general de activos
                    <NavLink
                        to="/assets/maintenance"
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