// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import UserCrud from './components/UserCrud';
import Navbar from './components/Navbar'; // ¡Importa Navbar!
import Sidebar from './components/Sidebar'; // ¡Importa Sidebar!

// Componente de Layout para rutas protegidas
const ProtectedLayout = ({ children, onLogout, user }) => {
  const location = useLocation(); // Hook para obtener la ruta actual

  // Asegúrate de que el usuario esté autenticado. Si no, redirige.
  // Esto es una capa extra de seguridad si alguien intenta acceder directamente a las rutas.
  const isAuthenticated = localStorage.getItem('accessToken');
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex flex-col h-screen"> {/* Contenedor principal para la altura completa */}
      <Navbar onLogout={onLogout} user={user} /> {/* Navbar fijo en la parte superior */}
      <div className="flex flex-1"> {/* Contenedor para Sidebar y Contenido */}
        <Sidebar /> {/* Sidebar a la izquierda */}
        <main className="flex-1 overflow-auto p-4 bg-gray-50"> {/* Contenido principal, scrollable */}
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Estado para la info del usuario

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData'); // Asume que guardaste info del usuario aquí al login
    if (token) {
      setIsAuthenticated(true);
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user); // Guarda la info del usuario al loguearse
    localStorage.setItem('userData', JSON.stringify(user)); // Guarda en localStorage
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.clear(); // Limpia todos los tokens y datos de usuario
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Rutas Protegidas envueltas en ProtectedLayout */}
        <Route
          path="/home"
          element={
            <ProtectedLayout onLogout={handleLogout} user={currentUser}>
              <Home onLogout={handleLogout} /> {/* Home ahora no necesita su propio botón de logout, pero lo dejamos si hace otra cosa */}
            </ProtectedLayout>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedLayout onLogout={handleLogout} user={currentUser}>
              <UserCrud />
            </ProtectedLayout>
          }
        />

        {/* Redirección por defecto: si está autenticado, va a home, si no, a login */}
        <Route
          path="*"
          element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;