import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons'; // Importamos faUserCircle para el icono de usuario

function Navbar() {
    const { user, logout } = useAuth();

    // Función para obtener el nombre del rol del usuario.
    // Asegúrate de que tu objeto 'user' de AuthContext tenga 'role_name'.
    const getRoleName = () => {
        if (user && user.role_name) {
            return user.role_name;
        }
        return 'Sin Rol';
    };

    // Determine display data: employee info if assigned, otherwise user info
    const displayData = user && user.employee_data ? {
        ...user.employee_data,
        role_name: user.role_name // Keep user role
    } : user;

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
            {/* Espacio para cualquier elemento a la izquierda del navbar, como un botón de menú para mobile */}
            <div>
                {/* Puedes poner un botón de hamburguesa aquí para el sidebar en mobile */}
            </div>

            {/* Información del Usuario a la derecha */}
            <div className="flex items-center space-x-4">
                {user && displayData && (
                    <Link
                        to="/profile"
                        className="flex items-center hover:bg-gray-100 rounded-lg p-2 transition duration-200"
                        title="Ver mi perfil"
                    >
                        <FontAwesomeIcon icon={faUserCircle} className="text-gray-600 text-3xl mr-3" />
                        <div>
                            <p className="text-gray-800 font-semibold text-lg leading-tight">
                                {displayData.first_name} {displayData.last_name}
                            </p>
                            <p className="text-gray-600 text-sm leading-tight -mt-0.5">
                                {/* Mostrar puesto, departamento y región */}
                                ({user.employee_data ? 'Empleado' : (displayData.puesto || 'N/A')}, {displayData.department_name || displayData.departamento_name || 'N/A'}, {displayData.region_name || 'N/A'})
                            </p>
                        </div>
                    </Link>
                )}

                {/* Botón de Cerrar Sesión (solo icono) */}
                <button
                    onClick={logout}
                    className="ml-6 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150"
                    title="Cerrar Sesión"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} className="text-xl" />
                </button>
            </div>
        </nav>
    );
}

export default Navbar;