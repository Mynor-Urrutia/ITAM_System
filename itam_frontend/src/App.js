// C:\Proyectos\ITAM_System\itam_frontend\src\App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importa tus componentes existentes
import Login from './components/Login';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UserCrud from './components/UserCrud';
import RoleManagement from './components/RoleManagement';
import PrivateRoute from './components/PrivateRoute'; // Asegúrate de que PrivateRoute está disponible

// Importa las páginas de Datos Maestros
import RegionsPage from './pages/masterdata/RegionsPage';
import FarmsPage from './pages/masterdata/FarmsPage';
import DepartmentsPage from './pages/masterdata/DepartmentsPage'; // ¡NUEVO!
import AreasPage from './pages/masterdata/AreasPage'; // ¡NUEVO!

// Este componente AppContent usará el AuthContext
const AppContent = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-2xl">Cargando aplicación...</div>;
    }

    return (
        <>
            {/* Si el usuario está autenticado, renderiza Navbar y Sidebar */}
            {isAuthenticated ? (
                <div className="flex h-screen">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                        <Navbar />
                        <main className="flex-1 p-6 overflow-auto bg-gray-100">
                            <Routes>
                                {/* Rutas Protegidas */}
                                <Route path="/home" element={<Home />} />
                                
                                <Route
                                    path="/users"
                                    element={
                                        <PrivateRoute requiredPermissions={['users.view_customuser']}>
                                            <UserCrud />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/roles-management"
                                    element={
                                        <PrivateRoute requiredPermissions={['auth.view_group']}>
                                            <RoleManagement />
                                        </PrivateRoute>
                                    }
                                />

                                {/* Rutas para Datos Maestros */}
                                <Route
                                    path="/masterdata/regions"
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_region']}>
                                            <RegionsPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/masterdata/farms"
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_finca']}>
                                            <FarmsPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/masterdata/departments" // ¡NUEVA RUTA!
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_departamento']}>
                                            <DepartmentsPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/masterdata/areas" // ¡NUEVA RUTA!
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_area']}>
                                            <AreasPage />
                                        </PrivateRoute>
                                    }
                                />

                                {/* Ejemplo de otras rutas existentes */}
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
                                        <PrivateRoute requiredPermissions={['assets.view_asset']}>
                                            <div>Mantenimiento de Activos</div>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/about"
                                    element={
                                        <PrivateRoute>
                                            <div>Acerca de</div>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/contact"
                                    element={
                                        <PrivateRoute>
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