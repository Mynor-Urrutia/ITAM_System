// C:\Proyectos\ITAM_System\itam_frontend\src\components\RoleManagement.js

import React, { useState, useEffect } from 'react';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '../api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Pagination from './Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

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
    const [showModal, setShowModal] = useState(false);
    const [expandedCards, setExpandedCards] = useState(new Set());

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSizeOptions = [5, 10, 25, 50, 100, 200];

    const { hasPermission } = useAuth();

    const canAddRole = hasPermission('auth.add_group');
    const canChangeRole = hasPermission('auth.change_group');
    const canDeleteRole = hasPermission('auth.delete_group');

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, [currentPage, pageSize]);

    const fetchRoles = async () => {
        try {
            const params = {
                page: currentPage,
                page_size: pageSize
            };
            const response = await getRoles(params);
            setRoles(response.data.results || response.data);
            setTotalPages(Math.ceil((response.data.count || response.data.length) / pageSize));
            setTotalCount(response.data.count || response.data.length);
        } catch (error) {
            console.error("Error fetching roles:", error);
            toast.error("Error al cargar los roles.");
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await getPermissions();
            const fetchedPermissions = response.data;
            setPermissions(fetchedPermissions);

            // ------------------------------------------------------------------
            // AGRUPAMIENTO POR MODELO CON ACCIONES HORIZONTALES
            // ------------------------------------------------------------------
            const grouped = fetchedPermissions.reduce((acc, perm) => {
                const modelName = perm.model_name || 'General';

                if (!acc[modelName]) {
                    acc[modelName] = [];
                }
                acc[modelName].push(perm);
                return acc;
            }, {});

            // Ordenar las acciones dentro de cada modelo (Add, Change, Delete, View)
            for (const model in grouped) {
                grouped[model].sort((a, b) => {
                    const order = { 'Add': 1, 'Change': 2, 'Delete': 3, 'View': 4 };
                    return (order[a.action_type] || 99) - (order[b.action_type] || 99);
                });
            }
            // ------------------------------------------------------------------
            // FIN DEL AGRUPAMIENTO POR MODELO
            // ------------------------------------------------------------------

            setGroupedPermissions(grouped);
        } catch (error) {
            console.error("Error fetching permissions:", error);
            toast.error("Error al cargar los permisos.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
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

    const handleSelectAllInGroup = (modelName) => {
        const groupPermissions = groupedPermissions[modelName] || [];
        const groupPermissionIds = groupPermissions.map(p => p.id);
        const allSelected = groupPermissionIds.every(id => selectedPermissionIds.has(id));

        setSelectedPermissionIds((prev) => {
            const newSet = new Set(prev);
            if (allSelected) {
                // Deselect all in group
                groupPermissionIds.forEach(id => newSet.delete(id));
            } else {
                // Select all in group
                groupPermissionIds.forEach(id => newSet.add(id));
            }
            return newSet;
        });
    };

    const handleSelectAllPermissions = () => {
        const allPermissionIds = Object.values(groupedPermissions).flat().map(p => p.id);
        const allSelected = allPermissionIds.every(id => selectedPermissionIds.has(id));

        setSelectedPermissionIds((prev) => {
            if (allSelected) {
                // Deselect all
                return new Set();
            } else {
                // Select all
                return new Set(allPermissionIds);
            }
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
                await updateRole(currentRole.id, payload);
                toast.success("Rol actualizado exitosamente!");
            } else {
                await createRole(payload);
                toast.success("Rol creado exitosamente!");
            }
            resetForm();
            fetchRoles();
        } catch (error) {
            console.error("Error saving role:", error.response?.data || error.message);
            toast.error(`Error al guardar el rol: ${error.response?.data?.name || "Verifica los datos."}`);
        }
    };

    const handleAddClick = () => {
        setCurrentRole(null);
        setRoleName('');
        setSelectedPermissionIds(new Set());
        setIsEditMode(false);
        setShowModal(true);
    };

    const handleEditClick = (role) => {
        setCurrentRole(role);
        setRoleName(role.name);
        // Inicializa los permisos seleccionados con los permisos actuales del rol
        setSelectedPermissionIds(new Set(role.permissions.map((p) => p.id)));
        setIsEditMode(true);
        setShowModal(true);
    };

    const handleDeleteClick = async (roleId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este rol?")) {
            try {
                await deleteRole(roleId);
                toast.success("Rol eliminado exitosamente!");
                fetchRoles();
            } catch (error) {
                console.error("Error deleting role:", error.response?.data || error.message);
                toast.error("Error al eliminar el rol. Asegúrate de que no haya usuarios asignados a él.");
            }
        }
    };

    const toggleCardExpansion = (roleId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(roleId)) {
            newExpanded.delete(roleId);
        } else {
            newExpanded.add(roleId);
        }
        setExpandedCards(newExpanded);
    };

    const resetForm = () => {
        setCurrentRole(null);
        setRoleName('');
        setSelectedPermissionIds(new Set());
        setIsEditMode(false);
        setShowModal(false);
    };

    const handleCloseModal = () => {
        resetForm();
    };

    if (isLoading) {
        return <div className="text-center py-8">Cargando gestión de roles...</div>;
    }

    return (
        <div className="p-2 sm:p-4 relative min-h-screen">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
                {/* Title */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Gestión de Roles y Permisos</h1>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Gestión de Roles y Permisos
                    </h1>
                    <div className="flex items-center space-x-4">
                        {canAddRole && (
                            <button
                                onClick={handleAddClick}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Crear Nuevo Rol
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
                {roles.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay roles disponibles.</p>
                ) : (
                    roles.map((role) => {
                        const isExpanded = expandedCards.has(role.id);
                        return (
                            <div key={role.id} className="bg-white rounded-lg shadow border">
                                {/* Header - Always visible */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{role.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Permisos:</span> {role.permissions.length}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <button
                                                onClick={() => toggleCardExpansion(role.id)}
                                                className="text-gray-500 hover:text-gray-700 p-1"
                                                title={isExpanded ? "Contraer" : "Expandir"}
                                            >
                                                <FontAwesomeIcon
                                                    icon={isExpanded ? faChevronUp : faChevronDown}
                                                    className="text-sm"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Content */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-200">
                                        <div className="space-y-2 mt-3">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Permisos Asignados:</span>
                                                <div className="mt-1">
                                                    {(() => {
                                                        // Group permissions by model
                                                        const groupedPerms = role.permissions.reduce((acc, perm) => {
                                                            const modelName = perm.model_name || 'General';
                                                            if (!acc[modelName]) acc[modelName] = [];
                                                            acc[modelName].push(perm);
                                                            return acc;
                                                        }, {});

                                                        // Sort actions within each model
                                                        Object.keys(groupedPerms).forEach(model => {
                                                            groupedPerms[model].sort((a, b) => {
                                                                const order = { 'Add': 1, 'Change': 2, 'Delete': 3, 'View': 4 };
                                                                return (order[a.action_type] || 99) - (order[b.action_type] || 99);
                                                            });
                                                        });

                                                        // Format as JSX with bold model names
                                                        return Object.keys(groupedPerms).sort().map((modelName, index) => {
                                                            const displayName = modelName.replace(/_/g, ' ').replace('Customuser', 'Usuario');
                                                            const actions = groupedPerms[modelName].map(p => p.action_type.toLowerCase()).join(', ');
                                                            return (
                                                                <div key={modelName} className="mb-1">
                                                                    <strong>{displayName}:</strong> {actions}
                                                                    {index < Object.keys(groupedPerms).length - 1 && '; '}
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {canChangeRole && (
                                                <button
                                                    onClick={() => handleEditClick(role)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                    Editar
                                                </button>
                                            )}
                                            {canDeleteRole && (
                                                <button
                                                    onClick={() => handleDeleteClick(role.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                                    title="Eliminar"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre del Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Permisos Asignados
                            </th>
                            {(canChangeRole || canDeleteRole) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {roles.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeRole || canDeleteRole) ? 3 : 2} className="px-6 py-4 text-center text-gray-500">
                                    No hay roles disponibles.
                                </td>
                            </tr>
                        ) : (
                            roles.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {role.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {(() => {
                                            // Group permissions by model
                                            const groupedPerms = role.permissions.reduce((acc, perm) => {
                                                const modelName = perm.model_name || 'General';
                                                if (!acc[modelName]) acc[modelName] = [];
                                                acc[modelName].push(perm);
                                                return acc;
                                            }, {});

                                            // Sort actions within each model
                                            Object.keys(groupedPerms).forEach(model => {
                                                groupedPerms[model].sort((a, b) => {
                                                    const order = { 'Add': 1, 'Change': 2, 'Delete': 3, 'View': 4 };
                                                    return (order[a.action_type] || 99) - (order[b.action_type] || 99);
                                                });
                                            });

                                            // Format as JSX with bold model names
                                            return Object.keys(groupedPerms).sort().map((modelName, index) => {
                                                const displayName = modelName.replace(/_/g, ' ').replace('Customuser', 'Usuario');
                                                const actions = groupedPerms[modelName].map(p => p.action_type.toLowerCase()).join(', ');
                                                return (
                                                    <span key={modelName}>
                                                        <strong>{displayName}:</strong> {actions}
                                                        {index < Object.keys(groupedPerms).length - 1 && '; '}
                                                    </span>
                                                );
                                            });
                                        })()}
                                    </td>
                                    {(canChangeRole || canDeleteRole) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {canChangeRole && (
                                                <button
                                                    onClick={() => handleEditClick(role)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                            {canDeleteRole && (
                                                <button
                                                    onClick={() => handleDeleteClick(role.id)}
                                                    className="text-red-600 hover:text-red-900 p-2 ml-2"
                                                    title="Eliminar"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Component */}
            {totalCount > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    pageSizeOptions={pageSizeOptions}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            <Modal show={showModal} onClose={handleCloseModal} title={isEditMode ? 'Editar Rol' : 'Crear Nuevo Rol'} size="large">
                <form onSubmit={handleCreateEditRole}>
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
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">Permisos</label>
                            <button
                                type="button"
                                onClick={handleSelectAllPermissions}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Object.values(groupedPermissions).flat().every(p => selectedPermissionIds.has(p.id))
                                    ? 'Deseleccionar Todos'
                                    : 'Seleccionar Todos los Permisos'}
                            </button>
                        </div>
                        <div className="bg-white p-4 rounded-md border border-gray-200 max-h-96 overflow-y-auto">
                            {/* Iterar sobre los modelos agrupados */}
                            {Object.keys(groupedPermissions).sort().map((modelName) => (
                                <div key={modelName} className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-lg font-semibold text-gray-800">
                                            {modelName.replace(/_/g, ' ').replace('Customuser', 'Usuario')}:
                                        </h5>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectAllInGroup(modelName)}
                                            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                        >
                                            {groupedPermissions[modelName].every(p => selectedPermissionIds.has(p.id))
                                                ? 'Deseleccionar Todo'
                                                : 'Seleccionar Todo'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {groupedPermissions[modelName].map((perm) => (
                                            <div key={perm.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`perm-${perm.id}`}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    checked={selectedPermissionIds.has(perm.id)}
                                                    onChange={() => handlePermissionChange(perm.id)}
                                                />
                                                <label htmlFor={`perm-${perm.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer capitalize">
                                                    {perm.action_type.toLowerCase()}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
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
            </Modal>

            {/* Mobile Floating Action Button */}
            {canAddRole && (
                <div className="block sm:hidden fixed bottom-6 right-6 z-10">
                    <button
                        onClick={handleAddClick}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                        title="Crear Nuevo Rol"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xl" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;