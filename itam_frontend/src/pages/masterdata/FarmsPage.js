/**
 * Página de Gestión de Fincas.
 *
 * Interfaz completa para administrar fincas agrícolas con asignación
 * a regiones geográficas. Incluye gestión CRUD completa con vistas
 * duales (cards móviles / tabla desktop) y permisos granulares.
 *
 * Características principales:
 * - Gestión CRUD completa de fincas
 * - Asignación opcional a regiones geográficas
 * - Información de dirección y ubicación
 * - Vista dual: cards móviles / tabla desktop
 * - Estados de carga y manejo de errores completo
 * - Diseño responsive con navegación intuitiva
 */

import React, { useState, useEffect } from 'react';
import { getFincas, getRegions, deleteFinca } from '../../api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import FincaFormModal from './FincaFormModal'; // Importa el nuevo componente del modal
import Pagination from '../../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

function FarmsPage() {
    const [fincas, setFincas] = useState([]);
    const [regions, setRegions] = useState([]); // Necesitamos las regiones para el select en el modal
    const [showModal, setShowModal] = useState(false); // Nuevo estado para controlar la visibilidad del modal
    const [fincaToEdit, setFincaToEdit] = useState(null); // Nuevo estado para la finca a editar
    const [expandedCards, setExpandedCards] = useState(new Set());

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSizeOptions = [5, 10, 25, 50, 100, 200];

    const { hasPermission } = useAuth();

    const canAddFinca = hasPermission('masterdata.add_finca');
    const canChangeFinca = hasPermission('masterdata.change_finca');
    const canDeleteFinca = hasPermission('masterdata.delete_finca');

    useEffect(() => {
        fetchFincas();
        fetchRegions();
    }, [currentPage, pageSize]);

    const fetchFincas = async () => {
        try {
            const params = {
                page: currentPage,
                page_size: pageSize
            };
            const response = await getFincas(params);
            setFincas(response.data.results || response.data);
            setTotalPages(Math.ceil((response.data.count || response.data.length) / pageSize));
            setTotalCount(response.data.count || response.data.length);
        } catch (error) {
            console.error('Error fetching fincas:', error);
            toast.error('Error al cargar las fincas.');
        }
    };

    const fetchRegions = async () => {
        try {
            const response = await getRegions();
            setRegions(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching regions:', error);
            // No es crítico si no se cargan las regiones, solo el select estará vacío
        }
    };

    const handleEditClick = (finca) => {
        setFincaToEdit(finca);
        setShowModal(true);
    };

    const handleCreateClick = () => {
        setFincaToEdit(null);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setFincaToEdit(null);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleSaveSuccess = () => {
        fetchFincas(); // Refresca la lista de fincas
    };

    const toggleCardExpansion = (fincaId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(fincaId)) {
            newExpanded.delete(fincaId);
        } else {
            newExpanded.add(fincaId);
        }
        setExpandedCards(newExpanded);
    };

    const handleDeleteFinca = async (fincaId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta finca?')) {
            return;
        }
        try {
            await deleteFinca(fincaId);
            toast.success('Finca eliminada exitosamente!');
            fetchFincas();
        } catch (error) {
            console.error('Error deleting finca:', error.response?.data || error.message);
            // Aquí podrías añadir un manejo específico si una finca no se puede eliminar por dependencias futuras
            toast.error('Error al eliminar la finca. Inténtelo de nuevo.');
        }
    };

    return (
        <div className="p-2 sm:p-4 relative min-h-screen">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
                {/* Title */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Gestión de Fincas</h1>
                </div>

                {/* Search Box for Mobile */}
                <div className="mb-4">
                    <div className="relative">
                        <label htmlFor="search" className="sr-only">Buscar Fincas</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Buscar fincas..."
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Fincas</h1>

                <div className="flex justify-end mb-4">
                    {canAddFinca && (
                        <button
                            onClick={handleCreateClick}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Crear Nueva Finca
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
                {fincas.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay fincas disponibles.</p>
                ) : (
                    fincas.map((finca) => {
                        const isExpanded = expandedCards.has(finca.id);
                        return (
                            <div key={finca.id} className="bg-white rounded-lg shadow border">
                                {/* Header - Always visible */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{finca.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Región:</span> {finca.region_name || 'Sin asignar'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleCardExpansion(finca.id)}
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
                                                <span className="font-medium">Dirección:</span> {finca.address || 'N/A'}
                                            </p>
                                        </div>
                                        {(canChangeFinca || canDeleteFinca) && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {canChangeFinca && (
                                                    <button
                                                        onClick={() => handleEditClick(finca)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                                                        title="Editar"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                        Editar
                                                    </button>
                                                )}
                                                {canDeleteFinca && (
                                                    <button
                                                        onClick={() => handleDeleteFinca(finca.id)}
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
                                Región
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dirección
                            </th>
                            {(canChangeFinca || canDeleteFinca) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {fincas.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeFinca || canDeleteFinca) ? 4 : 3} className="px-6 py-4 text-center text-gray-500">
                                    No hay fincas disponibles.
                                </td>
                            </tr>
                        ) : (
                            fincas.map((finca) => (
                                <tr key={finca.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {finca.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {finca.region_name || 'Sin asignar'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {finca.address || 'N/A'}
                                    </td>
                                    {(canChangeFinca || canDeleteFinca) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {canChangeFinca && (
                                                <button
                                                    onClick={() => handleEditClick(finca)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                            {canDeleteFinca && (
                                                <button
                                                    onClick={() => handleDeleteFinca(finca.id)}
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

            {/* El Modal para crear/editar fincas */}
            <FincaFormModal
                show={showModal}
                onClose={handleModalClose}
                onSaveSuccess={handleSaveSuccess}
                fincaToEdit={fincaToEdit}
                regions={regions} // Pasa las regiones al modal para el select
            />

            {/* Mobile Floating Action Button */}
            {canAddFinca && (
                <div className="block sm:hidden fixed bottom-6 right-6 z-10">
                    <button
                        onClick={handleCreateClick}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                        title="Crear Nueva Finca"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xl" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default FarmsPage;