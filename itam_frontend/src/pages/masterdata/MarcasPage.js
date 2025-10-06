// itam_frontend/src/pages/masterdata/MarcasPage.js

import React, { useState, useEffect } from 'react';
import { getMarcas, deleteMarca } from '../../api';
import MarcaFormModal from './MarcaFormModal';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

function MarcasPage() {
    const [marcas, setMarcas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMarca, setCurrentMarca] = useState(null);
    const [expandedCards, setExpandedCards] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { hasPermission } = useAuth();

    const canAddMarca = hasPermission('masterdata.add_marca');
    const canChangeMarca = hasPermission('masterdata.change_marca');
    const canDeleteMarca = hasPermission('masterdata.delete_marca');

    useEffect(() => {
        fetchMarcas(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const fetchMarcas = async (page = 1, size = 5) => {
        try {
            const response = await getMarcas({ page, page_size: size });
            setMarcas(response.data.results);
            setTotalCount(response.data.count);
            setTotalPages(Math.ceil(response.data.count / size));
        } catch (error) {
            console.error('Error fetching marcas:', error);
            toast.error('Error al cargar las marcas.');
        }
    };

    const handleAddClick = () => {
        setCurrentMarca(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (marca) => {
        setCurrentMarca(marca);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
            return;
        }
        try {
            await deleteMarca(id);
            toast.success('Marca eliminada correctamente.');
            fetchMarcas();
        } catch (error) {
            console.error('Error deleting marca:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || 'Error al eliminar la marca.';
            toast.error(errorMessage);
        }
    };

    const handleSaveSuccess = () => {
        fetchMarcas(currentPage, pageSize);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentMarca(null);
    };

    const toggleCardExpansion = (marcaId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(marcaId)) {
            newExpanded.delete(marcaId);
        } else {
            newExpanded.add(marcaId);
        }
        setExpandedCards(newExpanded);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    return (
        <div className="p-2 sm:p-4 relative min-h-screen">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
                {/* Title */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Gestión de Marcas</h1>
                </div>

                {/* Search Box for Mobile */}
                <div className="mb-4">
                    <div className="relative">
                        <label htmlFor="search" className="sr-only">Buscar Marcas</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Buscar marcas..."
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Marcas</h1>

                <div className="flex justify-end mb-4">
                    {canAddMarca && (
                        <button
                            onClick={handleAddClick}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Crear Nueva Marca
                        </button>
                    )}
                </div>
            </div>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
                {marcas.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay marcas disponibles.</p>
                ) : (
                    marcas.map((marca) => {
                        const isExpanded = expandedCards.has(marca.id);
                        return (
                            <div key={marca.id} className="bg-white rounded-lg shadow border">
                                {/* Header - Always visible */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{marca.name}</h3>
                                        </div>
                                        <button
                                            onClick={() => toggleCardExpansion(marca.id)}
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
                                                <span className="font-medium">Descripción:</span> {marca.description || 'N/A'}
                                            </p>
                                        </div>
                                        {(canChangeMarca || canDeleteMarca) && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {canChangeMarca && (
                                                    <button
                                                        onClick={() => handleEditClick(marca)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                                                        title="Editar"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                        Editar
                                                    </button>
                                                )}
                                                {canDeleteMarca && (
                                                    <button
                                                        onClick={() => handleDeleteClick(marca.id)}
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
                            {(canChangeMarca || canDeleteMarca) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {marcas.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeMarca || canDeleteMarca) ? 3 : 2} className="px-6 py-4 text-center text-gray-500">
                                    No hay marcas disponibles.
                                </td>
                            </tr>
                        ) : (
                            marcas.map((marca) => (
                                <tr key={marca.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {marca.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {marca.description || 'N/A'}
                                    </td>
                                    {(canChangeMarca || canDeleteMarca) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {canChangeMarca && (
                                                <button
                                                    onClick={() => handleEditClick(marca)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                            {canDeleteMarca && (
                                                <button
                                                    onClick={() => handleDeleteClick(marca.id)}
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

            {totalPages > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    pageSizeOptions={[5, 10, 20, 50]}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            <MarcaFormModal
                show={isModalOpen}
                onClose={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
                marcaToEdit={currentMarca}
            />

            {/* Mobile Floating Action Button */}
            {canAddMarca && (
                <div className="block sm:hidden fixed bottom-6 right-6 z-10">
                    <button
                        onClick={handleAddClick}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                        title="Crear Nueva Marca"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xl" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default MarcasPage;