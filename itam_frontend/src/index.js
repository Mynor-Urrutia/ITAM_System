// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Importa 'react-dom/client' para React 18
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root')); // Nueva forma de renderizar en React 18
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Si quieres reportar métricas de rendimiento (opcional)
reportWebVitals();