// C:\Proyectos\ITAM_System\itam_frontend\src\App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Importa Navigate
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importa tus componentes
import Login from './components/Login';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UserCrud from './components/UserCrud';
import RoleManagement from './components/RoleManagement'; // <-- ¡IMPORTA EL NUEVO COMPONENTE!
import PrivateRoute from './components/PrivateRoute'; // Asegúrate de que PrivateRoute está disponible

// Este componente AppContent usará el AuthContext
const AppContent = () => {
    const { isAuthenticated, loading } = useAuth(); // Obtiene el estado de autenticación y carga

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-2xl">Cargando aplicación...</div>;
    }

    return (
        <>
            {/* Si el usuario está autenticado, renderiza Navbar y Sidebar */}
            {isAuthenticated ? (
                <div className="flex h-screen"> {/* Contenedor principal para layout flex */}
                    <Sidebar /> {/* El Sidebar siempre visible a la izquierda */}
                    <div className="flex-1 flex flex-col"> {/* Contenedor para Navbar y Contenido */}
                        <Navbar /> {/* El Navbar en la parte superior del contenido principal */}
                        <main className="flex-1 p-6 overflow-auto bg-gray-100"> {/* Contenido principal */}
                            <Routes>
                                {/* Rutas Protegidas */}
                                <Route path="/home" element={<Home />} /> {/* Ruta para el Home */}
                                
                                {/* Ruta para Gestión de Usuarios con PrivateRoute */}
                                <Route
                                    path="/users"
                                    element={
                                        <PrivateRoute requiredPermissions={['users.view_customuser']}>
                                            <UserCrud />
                                        </PrivateRoute>
                                    }
                                />
                                {/* Ruta para Gestión de Roles con PrivateRoute */}
                                <Route
                                    path="/roles-management"
                                    element={
                                        <PrivateRoute requiredPermissions={['auth.view_group']}>
                                            <RoleManagement /> {/* Renderiza el componente RoleManagement */}
                                        </PrivateRoute>
                                    }
                                />
                                {/* Agrega aquí más rutas protegidas para componentes de gestión */}
                                {/* Ejemplo de otras rutas */}
                                <Route
                                    path="/reports"
                                    element={
                                        <PrivateRoute requiredPermissions={['reports.view_report']}>
                                            <div>Página de Reportes</div>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/assets"
                                    element={
                                        <PrivateRoute requiredPermissions={['assets.view_asset']}> {/* Asumiendo un permiso para activos */}
                                            <div>Mantenimiento de Activos</div>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/about"
                                    element={
                                        <PrivateRoute> {/* Podría no requerir permisos específicos */}
                                            <div>Acerca de</div>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/contact"
                                    element={
                                        <PrivateRoute> {/* Podría no requerir permisos específicos */}
                                            <div>Contacto</div>
                                        </PrivateRoute>
                                    }
                                />

                                {/* Ruta por defecto para autenticados */}
                                <Route path="/" element={<Navigate to="/home" replace />} />
                                {/* Si el usuario ya está autenticado y va a /login, redirigir a /home */}
                                <Route path="/login" element={<Navigate to="/home" replace />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            ) : (
                // Si no está autenticado, solo muestra la ruta de Login y redirige todo lo demás a login
                <Routes>
                    <Route path="/login" element={<Login />} />
                    {/* Cualquier otra ruta si no está autenticado, redirige a login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            )}
        </>
    );
};

function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;