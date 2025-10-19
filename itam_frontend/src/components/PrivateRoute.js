// C:\Proyectos\ITAM_System\itam_frontend\src\components\PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children, requiredPermissions = [] }) => {
    const { isAuthenticated, loading, hasPermission } = useAuth();

    // Use useEffect to handle side effects like showing toasts
    React.useEffect(() => {
        if (!loading && !isAuthenticated) {
            toast.error("Necesitas iniciar sesión para acceder a esta página.");
        } else if (!loading && isAuthenticated && requiredPermissions.length > 0) {
            const authorized = requiredPermissions.every(permission => hasPermission(permission));
            if (!authorized) {
                toast.error("No tienes los permisos necesarios para acceder a esta función.");
            }
        }
    }, [loading, isAuthenticated, hasPermission, requiredPermissions]);

    if (loading) {
        // Muestra un estado de carga mientras se verifica la autenticación
        return <div className="flex justify-center items-center h-screen text-2xl">Verificando acceso...</div>;
    }

    if (!isAuthenticated) {
        // Si no está autenticado, redirige al login
        return <Navigate to="/login" replace />;
    }

    // Verifica si se requieren permisos y si el usuario los tiene
    if (requiredPermissions.length > 0) {
        const authorized = requiredPermissions.every(permission => hasPermission(permission));
        if (!authorized) {
            // Si no tiene los permisos requeridos, redirige a una página de inicio
            return <Navigate to="/home" replace />;
        }
    }

    // Si está autenticado y tiene los permisos, renderiza el componente hijo
    return children;
};

export default PrivateRoute;