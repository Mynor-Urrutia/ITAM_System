// C:\Proyectos\ITAM_System\itam_frontend\src\App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importa tus componentes
import Login from './components/Login';
import Home from './components/Home';
import Navbar from './components/Navbar';   // Asegúrate de que estén importados
import Sidebar from './components/Sidebar'; // Asegúrate de que estén importados
import UserCrud from './components/UserCrud';
// Importa cualquier otro componente de gestión aquí

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
                                <Route path="/home" element={<Home />} />
                                <Route path="/users" element={<UserCrud />} />
                                {/* Agrega aquí más rutas protegidas para componentes de gestión */}
                                <Route path="/" element={<Home />} /> {/* Ruta por defecto para autenticados */}
                                {/* Si el usuario ya está autenticado y va a /login, redirigir a /home */}
                                <Route path="/login" element={<Home />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            ) : (
                // Si no está autenticado, solo muestra la ruta de Login
                <Routes>
                    <Route path="/login" element={<Login />} />
                    {/* Cualquier otra ruta si no está autenticado, redirige a login */}
                    <Route path="*" element={<Login />} />
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