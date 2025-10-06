// C:\\Proyectos\\ITAM_System\\itam_frontend\\src\\pages\\masterdata\\ModelosComputoPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import {
    getModelosActivo,
    deleteModeloActivo,
    getMarcas, // Para el formulario
    getTiposActivos // Para el formulario
} from '../../api';
import Modal from '../../components/Modal';
import ModeloActivoForm from '../../components/ModeloActivoForm'; // ❗ Importar el nuevo formulario
import Pagination from '../../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faLaptop, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

function ModelosActivoPage() {
    const [modelos, setModelos] = useState([]);
    const [marcas, setMarcas] = useState([]); // Datos para el formulario
    const [tiposActivo, setTiposActivo] = useState([]); // Datos para el formulario
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [currentModelo, setCurrentModelo] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [expandedCards, setExpandedCards] = useState(new Set());

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const { hasPermission } = useAuth();
    // Permisos a usar (asumidos por la configuración de urls.py/Sidebar.js)
    const canCreate = hasPermission('masterdata.add_modeloactivo');
    const canEdit = hasPermission('masterdata.change_modeloactivo');
    const canDelete = hasPermission('masterdata.delete_modeloactivo');
    const canView = hasPermission('masterdata.view_modeloactivo');

    const fetchModelos = useCallback(async (page = 1, size = 5) => {
        if (!canView) {
            setError('No tiene permiso para ver Modelos de Activo.');
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await getModelosActivo({ page, page_size: size });
            setModelos(response.data.results);
            setTotalCount(response.data.count);
            setTotalPages(Math.ceil(response.data.count / size));
            setError('');
        } catch (err) {
            console.error('Error fetching modelos:', err);
            setError('Error al cargar la lista de modelos.');
            toast.error('Error al cargar la lista de modelos.');
        } finally {
            setLoading(false);
        }
    }, [canView]);

    const fetchMasterData = useCallback(async () => {
        try {
            // Cargar datos necesarios para los select del formulario (todos para dropdowns)
            const [marcasRes, tiposActivoRes] = await Promise.all([getMarcas({ page_size: 1000 }), getTiposActivos({ page_size: 1000 })]);
            setMarcas(marcasRes.data.results);
            setTiposActivo(tiposActivoRes.data.results);
        } catch (err) {
            console.error('Error fetching related master data:', err);
            toast.error('Error al cargar datos de Marcas o Tipos de Activo para el formulario.');
        }
    }, []);

    useEffect(() => {
        fetchModelos(currentPage, pageSize);
        fetchMasterData();
    }, [fetchModelos, fetchMasterData, currentPage, pageSize]);


    const handleCreateClick = () => {
        if (!canCreate) {
            toast.error('No tienes permiso para crear modelos.');
            return;
        }
        setCurrentModelo(null);
        setIsEditMode(false);
        setShowModal(true);
    };

    const handleEditClick = (modelo) => {
        if (!canEdit) {
            toast.error('No tienes permiso para editar modelos.');
            return;
        }
        setCurrentModelo(modelo);
        setIsEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!canDelete) {
            toast.error('No tienes permiso para eliminar modelos.');
            return;
        }
        if (window.confirm('¿Está seguro de que desea eliminar este modelo?')) {
            try {
                await deleteModeloActivo(id);
                toast.success('Modelo de Activo eliminado con éxito.');
                fetchModelos(currentPage, pageSize);
            } catch (err) {
                console.error('Error deleting modelo:', err.response?.data || err);
                const errorMsg = err.response?.data?.detail || 'Error al eliminar el modelo. Verifique que no esté asignado a ningún activo.';
                toast.error(errorMsg);
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentModelo(null);
    };

    const toggleCardExpansion = (modeloId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(modeloId)) {
            newExpanded.delete(modeloId);
        } else {
            newExpanded.add(modeloId);
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
    
    // --- Renderizado ---

    if (!canView && !loading) {
        return <div className="p-4 text-red-500 text-lg">{error}</div>;
    }

    if (loading) {
        return <div className="p-4 text-gray-500">Cargando modelos...</div>;
    }

    if (error && modelos.length === 0) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-2 sm:p-4 relative min-h-screen">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
                {/* Title */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 text-center flex items-center justify-center">
                        <FontAwesomeIcon icon={faLaptop} className="mr-2 text-blue-600" />
                        Modelos de Activo
                    </h1>
                </div>

                {/* Search Box for Mobile */}
                <div className="mb-4">
                    <div className="relative">
                        <label htmlFor="search" className="sr-only">Buscar Modelos</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Buscar modelos..."
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                    <FontAwesomeIcon icon={faLaptop} className="mr-3 text-blue-600" />
                    Modelos de Activo
                </h1>

                <div className="flex justify-end mb-4">
                    {canCreate && (
                        <button
                            onClick={handleCreateClick}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Crear Modelo
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
                {modelos.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay modelos de activo registrados.</p>
                ) : (
                    modelos.map((modelo) => {
                        const isExpanded = expandedCards.has(modelo.id);
                        return (
                            <div key={modelo.id} className="bg-white rounded-lg shadow border">
                                {/* Header - Always visible */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{modelo.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Marca:</span> {modelo.marca_name}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleCardExpansion(modelo.id)}
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
                                                <span className="font-medium">Tipo de Activo:</span> {modelo.tipo_activo_name || 'N/A'}
                                            </p>
                                        </div>
                                        {(canEdit || canDelete) && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {canEdit && (
                                                    <button
                                                        onClick={() => handleEditClick(modelo)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                                                        title="Editar"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                        Editar
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(modelo.id)}
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
                                Modelo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Marca
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo de Activo
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {modelos.map((modelo) => (
                            <tr key={modelo.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {modelo.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {modelo.marca_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {modelo.tipo_activo_name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    {canEdit && (
                                        <button
                                            onClick={() => handleEditClick(modelo)}
                                            className="text-indigo-600 hover:text-indigo-900 p-2"
                                            title="Editar"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(modelo.id)}
                                            className="text-red-600 hover:text-red-900 p-2 ml-2"
                                            title="Eliminar"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {modelos.length === 0 && (
                    <p className="text-center py-4 text-gray-500">No hay modelos de cómputo registrados.</p>
                )}
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

            <Modal
                show={showModal}
                onClose={closeModal}
                title={isEditMode ? "Editar Modelo de Activo" : "Crear Nuevo Modelo de Activo"}
            >
                <ModeloActivoForm
                    key={currentModelo ? currentModelo.id : 'create'}
                    modelo={currentModelo}
                    onClose={closeModal}
                    onSave={() => fetchModelos(currentPage, pageSize)}
                    marcas={marcas}
                    tiposActivo={tiposActivo}
                />
            </Modal>

            {/* Mobile Floating Action Button */}
            {canCreate && (
                <div className="block sm:hidden fixed bottom-6 right-6 z-10">
                    <button
                        onClick={handleCreateClick}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                        title="Crear Nuevo Modelo"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xl" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ModelosActivoPage;