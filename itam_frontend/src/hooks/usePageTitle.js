import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'ITAM System';

    // Define titles based on routes
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

    if (routeTitles[path]) {
      title = `${routeTitles[path]} - ITAM System`;
    }

    document.title = title;
  }, [location]);
};

export default usePageTitle;