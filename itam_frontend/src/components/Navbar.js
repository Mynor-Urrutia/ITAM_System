/**
 * Componente Navbar para el sistema ITAM.
 *
 * Barra de navegación superior que muestra información del usuario autenticado,
 * botón de menú para móviles y opción de cerrar sesión.
 * Incluye enlace al perfil del usuario con información jerárquica.
 *
 * Características principales:
 * - Información del usuario con jerarquía organizacional
 * - Botón de menú responsive para sidebar móvil
 * - Enlace directo al perfil de usuario
 * - Botón de logout con confirmación visual
 * - Diseño consistente con el sistema de diseño
 * - Información contextual (tipo de usuario, departamento, región)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faBars } from '@fortawesome/free-solid-svg-icons';

/**
 * Componente de barra de navegación superior.
 *
 * @param {function} onMenuClick - Función para abrir/cerrar el menú lateral en móviles
 */
function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();

    /**
     * Obtiene el nombre del rol del usuario para mostrar.
     * Si no tiene rol asignado, muestra "Sin Rol".
     */
    const getRoleName = () => {
        if (user && user.role_name) {
            return user.role_name;
        }
        return 'Sin Rol';
    };

    /**
     * Determina qué datos mostrar: información del empleado si está asignado,
     * o información básica del usuario.
     */
    const displayData = user && user.employee_data ? {
        ...user.employee_data,
        role_name: user.role_name // Mantener el rol del usuario
    } : user;

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
            {/* Botón de menú para dispositivos móviles */}
            <div className="flex items-center">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    title="Abrir menú"
                    aria-label="Abrir menú de navegación"
                >
                    <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
                </button>
            </div>

            {/* Espacio vacío en el centro para balancear el layout */}
            <div></div>

            {/* Información del usuario autenticado a la derecha */}
            <div className="flex items-center space-x-4">
                {user && displayData && (
                    <Link
                        to="/profile"
                        className="flex items-center hover:bg-gray-100 rounded-lg p-2 transition duration-200"
                        title="Ver mi perfil"
                        aria-label="Ir al perfil de usuario"
                    >
                        {/* Icono de usuario */}
                        <FontAwesomeIcon icon={faUserCircle} className="text-gray-600 text-3xl mr-3" />

                        {/* Información del usuario */}
                        <div>
                            <p className="text-gray-800 font-semibold text-lg leading-tight">
                                {displayData.first_name} {displayData.last_name}
                            </p>
                            <p className="text-gray-600 text-sm leading-tight -mt-0.5">
                                {/* Mostrar jerarquía: tipo de usuario, departamento y región */}
                                ({user.employee_data ? 'Empleado' : (displayData.puesto || 'N/A')},
                                {displayData.department_name || displayData.departamento_name || 'N/A'},
                                {displayData.region_name || 'N/A'})
                            </p>
                        </div>
                    </Link>
                )}

                {/* Botón de cerrar sesión */}
                <button
                    onClick={logout}
                    className="ml-6 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150"
                    title="Cerrar Sesión"
                    aria-label="Cerrar sesión"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
                </button>
            </div>
        </nav>
    );
}

export default Navbar;