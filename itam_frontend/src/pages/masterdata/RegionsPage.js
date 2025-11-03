/**
 * Página de Gestión de Regiones del sistema ITAM.
 *
 * Gestiona las regiones geográficas de la organización:
 * - CRUD completo de regiones (crear, leer, actualizar, eliminar)
 * - Vista responsiva con cards expandibles para móvil y tabla para desktop
 * - Búsqueda básica por nombre de región
 * - Paginación configurable
 * - Control de permisos basado en roles
 * - Validación de integridad referencial (no eliminar si tiene fincas asignadas)
 *
 * Características principales:
 * - Gestión de datos maestros geográficos
 * - Interfaz intuitiva para administración
 * - Mensajes de error informativos
 * - Confirmaciones de eliminación
 * - Modales para formularios de creación/edición
 */

import React, { useState, useEffect } from 'react';
import { getRegions, deleteRegion } from '../../api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import RegionFormModal from './RegionFormModal'; // Importa el nuevo componente del modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../components/Pagination';

/**
 * Componente principal de la página de regiones.
 *
 * Gestiona la visualización y manipulación de las regiones geográficas,
 * incluyendo operaciones CRUD con validaciones de integridad.
 */
function RegionsPage() {
    const [regions, setRegions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // Nuevo estado para controlar la visibilidad del modal
    const [regionToEdit, setRegionToEdit] = useState(null); // Nuevo estado para la región a editar
    const [expandedCards, setExpandedCards] = useState(new Set());
    const { hasPermission } = useAuth();

    const canAddRegion = hasPermission('masterdata.add_region');
    const canChangeRegion = hasPermission('masterdata.change_region');
    const canDeleteRegion = hasPermission('masterdata.delete_region');
    const pageSizeOptions = [5, 10, 25, 50, 100, 200];

    useEffect(() => {
        fetchRegions();
    }, [currentPage, pageSize]);

    const fetchRegions = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize
            };
            const response = await getRegions(params);
            setRegions(response.data.results || response.data);
            setTotalPages(Math.ceil((response.data.count || response.data.length) / pageSize));
            setTotalCount(response.data.count || response.data.length);
        } catch (error) {
            console.error('Error fetching regions:', error);
            toast.error('Error al cargar las regiones.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleEditClick = (region) => {
        setRegionToEdit(region);
        setShowModal(true);
    };

    const handleCreateClick = () => {
        setRegionToEdit(null); // Asegúrate de que no haya ninguna región para editar
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setRegionToEdit(null); // Limpia la región a editar al cerrar el modal
    };

    const toggleCardExpansion = (regionId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(regionId)) {
            newExpanded.delete(regionId);
        } else {
            newExpanded.add(regionId);
        }
        setExpandedCards(newExpanded);
    };

    const handleSaveSuccess = () => {
        fetchRegions(); // Refresca la lista después de guardar con éxito
    };

    const handleDeleteRegion = async (regionId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta región? Si tiene fincas asignadas, no se podrá eliminar.')) {
            return;
        }
        try {
            await deleteRegion(regionId);
            toast.success('Región eliminada exitosamente!');
            fetchRegions();
        } catch (error) {
            console.error('Error deleting region:', error.response?.data || error.message);
            if (error.response && error.response.status === 400 && error.response.data && error.response.data.detail) {
                toast.error(error.response.data.detail);
            } else {
                toast.error('Error al eliminar la región. Inténtelo de nuevo.');
            }
        }
    };

    return (
        <div className="p-2 sm:p-4 relative min-h-screen">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
                {/* Title */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Gestión de Regiones</h1>
                </div>

                {/* Search Box for Mobile */}
                <div className="mb-4">
                    <div className="relative">
                        <label htmlFor="search" className="sr-only">Buscar Regiones</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Buscar regiones..."
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Regiones</h1>

                <div className="flex justify-end mb-4">
                    {canAddRegion && (
                        <button
                            onClick={handleCreateClick}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Crear Nueva Región
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
                {regions.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay regiones disponibles.</p>
                ) : (
                    regions.map((region) => {
                        const isExpanded = expandedCards.has(region.id);
                        return (
                            <div key={region.id} className="bg-white rounded-lg shadow border">
                                {/* Header - Always visible */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{region.name}</h3>
                                        </div>
                                        <button
                                            onClick={() => toggleCardExpansion(region.id)}
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
                                                <span className="font-medium">Descripción:</span> {region.description || 'N/A'}
                                            </p>
                                        </div>
                                        {(canChangeRegion || canDeleteRegion) && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {canChangeRegion && (
                                                    <button
                                                        onClick={() => handleEditClick(region)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                                                        title="Editar"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                        Editar
                                                    </button>
                                                )}
                                                {canDeleteRegion && (
                                                    <button
                                                        onClick={() => handleDeleteRegion(region.id)}
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
                                Descripción
                            </th>
                            {(canChangeRegion || canDeleteRegion) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {regions.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeRegion || canDeleteRegion) ? 3 : 2} className="px-6 py-4 text-center text-gray-500">
                                    No hay regiones disponibles.
                                </td>
                            </tr>
                        ) : (
                            regions.map((region) => (
                                <tr key={region.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {region.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {region.description || 'N/A'}
                                    </td>
                                    {(canChangeRegion || canDeleteRegion) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {canChangeRegion && (
                                                <button
                                                    onClick={() => handleEditClick(region)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                            {canDeleteRegion && (
                                                <button
                                                    onClick={() => handleDeleteRegion(region.id)}
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

            {/* El Modal para crear/editar regiones */}
            <RegionFormModal
                show={showModal}
                onClose={handleModalClose}
                onSaveSuccess={handleSaveSuccess}
                regionToEdit={regionToEdit}
            />

            {/* Mobile Floating Action Button */}
            {canAddRegion && (
                <div className="block sm:hidden fixed bottom-6 right-6 z-10">
                    <button
                        onClick={handleCreateClick}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                        title="Crear Nueva Región"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xl" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default RegionsPage;