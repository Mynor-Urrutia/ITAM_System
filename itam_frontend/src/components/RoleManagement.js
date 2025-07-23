// C:\Proyectos\ITAM_System\itam_frontend\src\components\RoleManagement.js

import React, { useState, useEffect } from 'react';
import api from '../api'; // Asegúrate de que tu instancia de Axios esté correctamente importada
import { toast } from 'react-toastify';
// ... otras importaciones necesarias como useAuth, etc.

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    // Cambiamos la estructura de agrupamiento para anidar
    const [groupedPermissions, setGroupedPermissions] = useState({}); // Permisos agrupados
    const [currentRole, setCurrentRole] = useState(null);
    const [roleName, setRoleName] = useState('');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles/');
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
            toast.error("Error al cargar los roles.");
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/permissions/');
            const fetchedPermissions = response.data;
            setPermissions(fetchedPermissions);

            // ------------------------------------------------------------------
            // INICIO DE LA NUEVA LÓGICA DE AGRUPAMIENTO ANIDADO (¡COPIA ESTO!)
            // ------------------------------------------------------------------
            const grouped = fetchedPermissions.reduce((acc, perm) => {
                const appLabel = perm.app_label_display || 'Otros'; // Usamos el nuevo campo
                const modelName = perm.model_name || 'General';     // Usamos el nuevo campo

                if (!acc[appLabel]) {
                    acc[appLabel] = {}; // Cada appLabel tendrá un objeto para los modelos
                }
                if (!acc[appLabel][modelName]) {
                    acc[appLabel][modelName] = []; // Cada modelName tendrá un array de permisos
                }
                acc[appLabel][modelName].push(perm);
                return acc;
            }, {});

            // Opcional: Ordenar las acciones dentro de cada modelo (Add, Change, Delete, View)
            for (const app in grouped) {
                for (const model in grouped[app]) {
                    grouped[app][model].sort((a, b) => {
                        const order = { 'Add': 1, 'Change': 2, 'Delete': 3, 'View': 4 };
                        return (order[a.action_type] || 99) - (order[b.action_type] || 99);
                    });
                }
            }
            // ------------------------------------------------------------------
            // FIN DE LA NUEVA LÓGICA DE AGRUPAMIENTO ANIDADO
            // ------------------------------------------------------------------

            setGroupedPermissions(grouped);
        } catch (error) {
            console.error("Error fetching permissions:", error);
            toast.error("Error al cargar los permisos.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePermissionChange = (permissionId) => {
        setSelectedPermissionIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId);
            } else {
                newSet.add(permissionId);
            }
            return newSet;
        });
    };

    const handleCreateEditRole = async (e) => {
        e.preventDefault();
        const payload = {
            name: roleName,
            permission_ids: Array.from(selectedPermissionIds),
        };

        try {
            if (isEditMode) {
                await api.put(`/roles/${currentRole.id}/`, payload);
                toast.success("Rol actualizado exitosamente!");
            } else {
                await api.post('/roles/', payload);
                toast.success("Rol creado exitosamente!");
            }
            resetForm();
            fetchRoles();
        } catch (error) {
            console.error("Error saving role:", error.response?.data || error.message);
            toast.error(`Error al guardar el rol: ${error.response?.data?.name || "Verifica los datos."}`);
        }
    };

    const handleEditClick = (role) => {
        setCurrentRole(role);
        setRoleName(role.name);
        // Inicializa los permisos seleccionados con los permisos actuales del rol
        setSelectedPermissionIds(new Set(role.permissions.map((p) => p.id)));
        setIsEditMode(true);
    };

    const handleDeleteClick = async (roleId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este rol?")) {
            try {
                await api.delete(`/roles/${roleId}/`);
                toast.success("Rol eliminado exitosamente!");
                fetchRoles();
            } catch (error) {
                console.error("Error deleting role:", error.response?.data || error.message);
                toast.error("Error al eliminar el rol. Asegúrate de que no haya usuarios asignados a él.");
            }
        }
    };

    const resetForm = () => {
        setCurrentRole(null);
        setRoleName('');
        setSelectedPermissionIds(new Set());
        setIsEditMode(false);
    };

    if (isLoading) {
        return <div className="text-center py-8">Cargando gestión de roles...</div>;
    }

    return (
        <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Roles</h2>

            {/* Formulario de Creación/Edición de Rol */}
            <form onSubmit={handleCreateEditRole} className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-2xl font-semibold mb-4 text-gray-700">
                    {isEditMode ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </h3>
                <div className="mb-4">
                    <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Rol
                    </label>
                    <input
                        type="text"
                        id="roleName"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Permisos</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-4 rounded-md border border-gray-200 h-96 overflow-y-auto">
                        {/* Iterar sobre los grupos de permisos por aplicación */}
                        {Object.keys(groupedPermissions).sort().map((appLabelDisplay) => (
                            <div key={appLabelDisplay} className="mb-4 p-2 border border-gray-200 rounded-md bg-gray-50">
                                <h4 className="text-xl font-bold text-gray-900 mb-3 border-b-2 pb-2">
                                    {appLabelDisplay}
                                </h4>
                                {/* Iterar sobre los modelos dentro de cada aplicación */}
                                {Object.keys(groupedPermissions[appLabelDisplay]).sort().map((modelName) => (
                                    <div key={modelName} className="mb-3 pl-2">
                                        <h5 className="text-lg font-semibold text-gray-800 mb-2 mt-2">
                                            {modelName.replace(/_/g, ' ').replace('Customuser', 'Usuario')}
                                            {/* Reemplaza 'Customuser' por 'Usuario' para un mejor display */}
                                        </h5>
                                        {groupedPermissions[appLabelDisplay][modelName].map((perm) => (
                                            <div key={perm.id} className="flex items-center mb-1">
                                                <input
                                                    type="checkbox"
                                                    id={`perm-${perm.id}`}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    checked={selectedPermissionIds.has(perm.id)}
                                                    onChange={() => handlePermissionChange(perm.id)}
                                                />
                                                <label htmlFor={`perm-${perm.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                                                    {perm.action_type}: {perm.name.replace(`Can ${perm.action_type.toLowerCase()} `, '')}
                                                    {/* Muestra "Ver: grupo", "Añadir: usuario" */}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                    >
                        {isEditMode ? 'Guardar Cambios' : 'Crear Rol'}
                    </button>
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                    >
                        Cancelar
                    </button>
                </div>
            </form>

            {/* Lista de Roles Existentes */}
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">Roles Existentes</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6">ID</th>
                            <th className="py-3 px-6">Nombre del Rol</th>
                            <th className="py-3 px-6">Permisos Asignados</th>
                            <th className="py-3 px-6 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm font-light">
                        {roles.map((role) => (
                            <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 whitespace-nowrap">{role.id}</td>
                                <td className="py-3 px-6">{role.name}</td>
                                <td className="py-3 px-6">
                                    {/* Mostrar solo el nombre legible del permiso, sin el 'Can add/change/delete/view' */}
                                    {role.permissions.map(p => p.name.replace(/Can (add|change|delete|view) /, '')).join(', ')}
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <button
                                        onClick={() => handleEditClick(role)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2 transition duration-200"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(role.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoleManagement;