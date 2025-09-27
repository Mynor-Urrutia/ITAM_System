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
import TipoActivosPage from './pages/masterdata/TiposActivosPage'; // ¡NUEVO!
import MarcasPage from './pages/masterdata/MarcasPage'; // ¡NUEVO!
import ModelosActivoPage from './pages/masterdata/ModelosActivoPage'; // Asegúrate de que el nombre coincida
import ProveedoresPage from './pages/masterdata/ProveedoresPage'; // ¡NUEVO!
import AuditLogsPage from './pages/masterdata/AuditLogsPage'; // ¡NUEVO!



// Este componente AppContent usará el AuthContext
const AppContent = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-2xl">Cargando...</div>;
    }

    return (
        <>
            {isAuthenticated ? (
                <div className="flex min-h-screen bg-gray-100">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Navbar />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                            <Routes>
                                <Route path="/home" element={<Home />} />
                                {/* Rutas de Administración */}
                                <Route
                                    path="/admin/users"
                                    element={
                                        <PrivateRoute requiredPermissions={['users.view_customuser']}>
                                            <UserCrud />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/admin/roles"
                                    element={
                                        <PrivateRoute requiredPermissions={['auth.view_group']}>
                                            <RoleManagement />
                                        </PrivateRoute>
                                    }
                                />
                                
                                {/* Rutas de Datos Maestros */}
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
                                    path="/masterdata/departments"
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_departamento']}>
                                            <DepartmentsPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/masterdata/areas"
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_area']}>
                                            <AreasPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/masterdata/tipo-activos"
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_tipoactivo']}>
                                            <TipoActivosPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/masterdata/marcas"
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_marca']}>
                                            <MarcasPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/masterdata/modelos-activo"
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_modeloactivo']}>
                                            <ModelosActivoPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/masterdata/proveedores"
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_proveedor']}>
                                            <ProveedoresPage />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/masterdata/audit-logs"
                                    element={
                                        <PrivateRoute requiredPermissions={['masterdata.view_auditlog']}>
                                            <AuditLogsPage />
                                        </PrivateRoute>
                                    }
                                />

                                {/* Rutas de Activos */}
                                <Route
                                    path="/assets/maintenance"
                                    element={
                                        <PrivateRoute requiredPermissions={['assets.view_mantenimiento']}>
                                            <div>Mantenimiento de Activos</div>
                                        </PrivateRoute>
                                    }
                                />

                                {/* Rutas de Información */}
                                <Route path="/about" element={<div>Acerca de</div>} />
                                <Route path="/contact" element={<div>Contacto</div>} />

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