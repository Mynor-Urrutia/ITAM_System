/**
 * Página de Gestión de Áreas del sistema ITAM.
 *
 * Gestiona las áreas funcionales dentro de los departamentos:
 * - CRUD completo de áreas (crear, leer, actualizar, eliminar)
 * - Vista responsiva con cards expandibles para móvil y tabla para desktop
 * - Relación jerárquica con departamentos
 * - Paginación configurable
 * - Control de permisos basado en roles
 * - Validación de integridad referencial
 *
 * Características principales:
 * - Gestión de subdivisiones departamentales
 * - Relaciones padre-hijo con departamentos
 * - Interfaz intuitiva para administración
 * - Mensajes de confirmación para operaciones destructivas
 * - Modales para formularios de creación/edición
 */

import React, { useState, useEffect } from 'react';
import { getAreas, deleteArea } from '../../api'; // Importa las funciones API
import AreaFormModal from './AreaFormModal'; // Importa el modal del formulario
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // Para permisos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

/**
 * Componente principal de la página de áreas.
 *
 * Gestiona la visualización y manipulación de las áreas funcionales,
 * incluyendo operaciones CRUD con validaciones de integridad
 * referencial y relaciones jerárquicas con departamentos.
 */
function AreasPage() {
    const [areas, setAreas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentArea, setCurrentArea] = useState(null); // Para editar
    const [expandedCards, setExpandedCards] = useState(new Set());

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSizeOptions = [5, 10, 25, 50, 100, 200];

    const { hasPermission } = useAuth();

    const canAddArea = hasPermission('masterdata.add_area');
    const canChangeArea = hasPermission('masterdata.change_area');
    const canDeleteArea = hasPermission('masterdata.delete_area');

    useEffect(() => {
        fetchAreas();
    }, [currentPage, pageSize]);

    const fetchAreas = async () => {
        try {
            const params = {
                page: currentPage,
                page_size: pageSize
            };
            const response = await getAreas(params);
            setAreas(response.data.results || response.data);
            setTotalPages(Math.ceil((response.data.count || response.data.length) / pageSize));
            setTotalCount(response.data.count || response.data.length);
        } catch (error) {
            console.error('Error fetching areas:', error);
            toast.error('Error al cargar las áreas.');
        }
    };

    const handleAddClick = () => {
        setCurrentArea(null); // Para formulario de creación
        setIsModalOpen(true);
    };

    const handleEditClick = (area) => {
        setCurrentArea(area); // Para formulario de edición
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta área?')) {
            return;
        }
        try {
            await deleteArea(id);
            toast.success('Área eliminada correctamente.');
            fetchAreas(); // Refrescar la lista
        } catch (error) {
            console.error('Error deleting area:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || 'Error al eliminar el área.';
            toast.error(errorMessage);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleSaveSuccess = () => {
        fetchAreas(); // Refresca la lista después de guardar/actualizar
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentArea(null); // Limpia el estado de edición al cerrar
    };

    const toggleCardExpansion = (areaId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(areaId)) {
            newExpanded.delete(areaId);
        } else {
            newExpanded.add(areaId);
        }
        setExpandedCards(newExpanded);
    };

    return (
        <div className="p-2 sm:p-4 relative min-h-screen">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
                {/* Title */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Gestión de Áreas</h1>
                </div>

                {/* Search Box for Mobile */}
                <div className="mb-4">
                    <div className="relative">
                        <label htmlFor="search" className="sr-only">Buscar Áreas</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Buscar áreas..."
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Áreas</h1>

                <div className="flex justify-end mb-4">
                    {canAddArea && (
                        <button
                            onClick={handleAddClick}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Crear Nueva Área
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
                {areas.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay áreas disponibles.</p>
                ) : (
                    areas.map((area) => {
                        const isExpanded = expandedCards.has(area.id);
                        return (
                            <div key={area.id} className="bg-white rounded-lg shadow border">
                                {/* Header - Always visible */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{area.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Departamento:</span> {area.departamento_name}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleCardExpansion(area.id)}
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

                                {/* Expandable Content */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-200">
                                        <div className="space-y-2 mt-3">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Descripción:</span> {area.description || 'N/A'}
                                            </p>
                                        </div>
                                        {(canChangeArea || canDeleteArea) && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {canChangeArea && (
                                                    <button
                                                        onClick={() => handleEditClick(area)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                                                        title="Editar"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                        Editar
                                                    </button>
                                                )}
                                                {canDeleteArea && (
                                                    <button
                                                        onClick={() => handleDeleteClick(area.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                                        title="Eliminar"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white shadow overflow-hidden rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Departamento
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descripción
                            </th>
                            {(canChangeArea || canDeleteArea) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {areas.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeArea || canDeleteArea) ? 4 : 3} className="px-6 py-4 text-center text-gray-500">
                                    No hay áreas disponibles.
                                </td>
                            </tr>
                        ) : (
                            areas.map((area) => (
                                <tr key={area.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {area.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {area.departamento_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {area.description || 'N/A'}
                                    </td>
                                    {(canChangeArea || canDeleteArea) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {canChangeArea && (
                                                <button
                                                    onClick={() => handleEditClick(area)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                            {canDeleteArea && (
                                                <button
                                                    onClick={() => handleDeleteClick(area.id)}
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

            <AreaFormModal
                show={isModalOpen}
                onClose={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
                areaToEdit={currentArea}
            />

            {/* Mobile Floating Action Button */}
            {canAddArea && (
                <div className="block sm:hidden fixed bottom-6 right-6 z-10">
                    <button
                        onClick={handleAddClick}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                        title="Crear Nueva Área"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xl" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default AreasPage;