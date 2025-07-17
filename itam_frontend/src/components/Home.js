// src/components/Home.js
import React from 'react';
// No necesitamos useNavigate si solo tenemos texto
// import { useNavigate } from 'react-router-dom';

function Home() { // Ya no recibe onLogout
  // const navigate = useNavigate(); // Ya no se usa si no hay navegación interna

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-green-100 p-4 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-green-800 mb-4">Bienvenido al Panel ITAM</h1>
      <p className="text-lg text-gray-700 mb-6">Utiliza el menú de la izquierda para navegar por el sistema.</p>
      {/* Botones de navegación eliminados, ya que están en el sidebar */}
    </div>
  );
}

export default Home;