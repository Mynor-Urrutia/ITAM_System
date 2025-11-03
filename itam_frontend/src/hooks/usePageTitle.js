/**
 * Hook personalizado para gestión automática del título de página.
 *
 * Actualiza dinámicamente el título del documento HTML basado en la ruta actual.
 * Mejora la experiencia del usuario en navegación y bookmarks.
 *
 * Características principales:
 * - Mapeo completo de rutas a títulos descriptivos en español
 * - Actualización automática al cambiar de ruta
 * - Títulos consistentes con la navegación del sistema
 * - Fallback a "ITAM System" para rutas no mapeadas
 * - Integración con React Router para detección de cambios
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook que actualiza el título de la página según la ruta actual.
 *
 * @returns {void} - No retorna valores, actualiza document.title
 */
const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'ITAM System';

    // Mapeo de rutas a títulos descriptivos en español
    const routeTitles = {
      '/home': 'Home',
      '/profile': 'Perfil de Usuario',
      '/admin/users': 'Administración de Usuarios',
      '/admin/roles': 'Gestión de Roles',
      '/masterdata/regions': 'Regiones',
      '/masterdata/farms': 'Fincas',
      '/masterdata/departments': 'Departamentos',
      '/masterdata/areas': 'Áreas',
      '/masterdata/tipo-activos': 'Tipos de Activos',
      '/masterdata/marcas': 'Marcas',
      '/masterdata/modelos-activo': 'Modelos de Activo',
      '/masterdata/proveedores': 'Proveedores',
      '/assets/activos': 'Activos',
      '/assets/assignments': 'Asignaciones',
      '/assets/maintenance': 'Mantenimiento',
      '/masterdata/audit-logs': 'Registros de Auditoría',
      '/employees/employees': 'Empleados',
      '/reports': 'Reportes',
      '/about': 'Acerca de',
      '/contact': 'Contacto',
      '/login': 'Iniciar Sesión',
    };

    // Actualiza el título si existe un mapeo para la ruta
    if (routeTitles[path]) {
      title = `${routeTitles[path]} - ITAM System`;
    }

    // Aplica el título al documento
    document.title = title;
  }, [location]); // Se ejecuta cada vez que cambia la ubicación
};

export default usePageTitle;