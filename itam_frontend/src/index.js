// C:\Proyectos\ITAM_System\itam_frontend\src\index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Tu archivo CSS de Tailwind
import App from './App';

// Importa y configura Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons'; // Importa todos los iconos sólidos

// Añade los iconos a la librería de Font Awesome
library.add(fas);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);