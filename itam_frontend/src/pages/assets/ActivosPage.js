// itam_frontend/src/pages/assets/ActivosPage.js

import React, { useState, useEffect } from 'react';
import { getActivos, deleteActivo, reactivateActivo } from '../../api';
import ActivoFormModal from './ActivoFormModal';
import ActivoDetailModal from './ActivoDetailModal';
import RetireActivoModal from './RetireActivoModal';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faSort, faSortUp, faSortDown, faUndo, faArchive } from '@fortawesome/free-solid-svg-icons';

function ActivosPage() {
    const [activos, setActivos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
    const [currentActivo, setCurrentActivo] = useState(null);
    const [selectedActivo, setSelectedActivo] = useState(null);
    const [activoToRetire, setActivoToRetire] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showRetired, setShowRetired] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [sortField, setSortField] = useState('hostname');
    const [sortDirection, setSortDirection] = useState('asc');
    const { hasPermission } = useAuth();

    const canAddActivo = hasPermission('masterdata.add_activo');
    const canChangeActivo = hasPermission('masterdata.change_activo');
    const canDeleteActivo = hasPermission('masterdata.delete_activo');

    useEffect(() => {
        fetchActivos(currentPage, pageSize);
    }, [currentPage, pageSize, showRetired, searchText, sortField, sortDirection]);

    const fetchActivos = async (page = 1, size = 5) => {
        try {
            const params = { page, page_size: size };
            if (showRetired) {
                params.estado = 'retirado';
            } else {
                params.estado = 'activo';
            }

            // Add search text (searches hostname, serie, region, solicitante, correo, orden_compra, cuenta_contable, departamento, area)
            if (searchText.trim()) params.search = searchText.trim();

            // Add ordering
            const ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;
            params.ordering = ordering;

            const response = await getActivos(params);
            setActivos(response.data.results);
            setTotalCount(response.data.count);
            setTotalPages(Math.ceil(response.data.count / size));
        } catch (error) {
            console.error('Error fetching activos:', error);
            toast.error('Error al cargar los activos.');
        }
    };

    const handleAddClick = () => {
        setCurrentActivo(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (activo) => {
        setCurrentActivo(activo);
        setIsModalOpen(true);
    };

    const handleViewClick = (activo) => {
        setSelectedActivo(activo);
        setIsDetailModalOpen(true);
    };

    const handleRetireClick = (activo) => {
        setActivoToRetire(activo);
        setIsRetireModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este activo?')) {
            return;
        }
        try {
            await deleteActivo(id);
            toast.success('Activo eliminado correctamente.');
            fetchActivos();
        } catch (error) {
            console.error('Error deleting activo:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || 'Error al eliminar el activo.';
            toast.error(errorMessage);
        }
    };

    const handleSaveSuccess = () => {
        fetchActivos(currentPage, pageSize);
    };

    const handleRetireSuccess = () => {
        setIsRetireModalOpen(false);
        setActivoToRetire(null);
        fetchActivos(currentPage, pageSize);
    };

    const handleReactivateClick = async (activo) => {
        if (!window.confirm('¿Estás seguro de que quieres reactivar este activo?')) {
            return;
        }
        try {
            await reactivateActivo(activo.id);
            toast.success('Activo reactivado correctamente.');
            fetchActivos(currentPage, pageSize);
        } catch (error) {
            console.error('Error reactivating activo:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.error || 'Error al reactivar el activo.';
            toast.error(errorMessage);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentActivo(null);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedActivo(null);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getWarrantyStatus = (fechaFinGarantia) => {
        if (!fechaFinGarantia) return { status: 'Sin garantía', color: 'text-gray-500' };

        const today = new Date();
        const warrantyEnd = new Date(fechaFinGarantia);

        if (warrantyEnd < today) {
            return { status: 'Vencida', color: 'text-red-600 bg-red-50' };
        }

        const daysLeft = Math.ceil((warrantyEnd - today) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 30) {
            return { status: `Próxima (${daysLeft} días)`, color: 'text-orange-600 bg-orange-50' };
        }

        return { status: 'Activa', color: 'text-green-600 bg-green-50' };
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle direction if same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    const getSortIcon = (field) => {
        if (sortField !== field) {
            return faSort;
        }
        return sortDirection === 'asc' ? faSortUp : faSortDown;
    };

    return (
        <div className="p-4">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Gestión de Activos {showRetired ? '(Retirados)' : '(Activos)'}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showRetired}
                                onChange={(e) => {
                                    setShowRetired(e.target.checked);
                                    setCurrentPage(1);
                                }}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Mostrar retirados</span>
                        </label>
                        {/* Search Box */}
                        <div className="relative">
                            <label htmlFor="search" className="sr-only">Buscar Activos</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Buscar por hostname, serie..."
                            />
                        </div>
                        {canAddActivo && (
                            <button
                                onClick={handleAddClick}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Crear Nuevo Activo
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('hostname')}>
                                <div className="flex items-center">
                                    Hostname
                                    <FontAwesomeIcon icon={getSortIcon('hostname')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('serie')}>
                                <div className="flex items-center">
                                    Serie
                                    <FontAwesomeIcon icon={getSortIcon('serie')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('tipo_activo__name')}>
                                <div className="flex items-center">
                                    Tipo de Equipo
                                    <FontAwesomeIcon icon={getSortIcon('tipo_activo__name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('marca__name')}>
                                <div className="flex items-center">
                                    Marca
                                    <FontAwesomeIcon icon={getSortIcon('marca__name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('modelo__name')}>
                                <div className="flex items-center">
                                    Modelo
                                    <FontAwesomeIcon icon={getSortIcon('modelo__name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('fecha_fin_garantia')}>
                                <div className="flex items-center">
                                    Fecha Venc. Garantía
                                    <FontAwesomeIcon icon={getSortIcon('fecha_fin_garantia')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado Garantía
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('region__name')}>
                                <div className="flex items-center">
                                    Región
                                    <FontAwesomeIcon icon={getSortIcon('region__name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('finca__name')}>
                                <div className="flex items-center">
                                    Finca
                                    <FontAwesomeIcon icon={getSortIcon('finca__name')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('estado')}>
                                <div className="flex items-center">
                                    Estado
                                    <FontAwesomeIcon icon={getSortIcon('estado')} className="ml-1 text-xs" />
                                </div>
                            </th>
                            {(canChangeActivo || canDeleteActivo) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activos.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeActivo || canDeleteActivo) ? 11 : 10} className="px-6 py-4 text-center text-gray-500">
                                    No hay activos disponibles.
                                </td>
                            </tr>
                        ) : (
                            activos.map((activo) => (
                                <tr key={activo.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {activo.hostname}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {activo.serie}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {activo.tipo_activo_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {activo.marca_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {activo.modelo_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {activo.fecha_fin_garantia ? new Date(activo.fecha_fin_garantia).toLocaleDateString('es-ES') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWarrantyStatus(activo.fecha_fin_garantia).color}`}>
                                            {getWarrantyStatus(activo.fecha_fin_garantia).status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {activo.region_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {activo.finca_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            activo.estado === 'activo'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {activo.estado === 'activo' ? 'Activo' : 'Retirado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button
                                            onClick={() => handleViewClick(activo)}
                                            className="text-blue-600 hover:text-blue-900 p-2"
                                            title="Ver Detalles"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        {showRetired && canChangeActivo && (
                                            <button
                                                onClick={() => handleReactivateClick(activo)}
                                                className="text-green-600 hover:text-green-900 p-2 ml-2"
                                                title="Reactivar Activo"
                                            >
                                                <FontAwesomeIcon icon={faUndo} />
                                            </button>
                                        )}
                                        {!showRetired && canChangeActivo && (
                                            <>
                                                <button
                                                    onClick={() => handleEditClick(activo)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2 ml-2"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    onClick={() => handleRetireClick(activo)}
                                                    className="text-orange-600 hover:text-orange-900 p-2 ml-2"
                                                    title="Retirar Activo"
                                                >
                                                    <FontAwesomeIcon icon={faArchive} />
                                                </button>
                                            </>
                                        )}
                                        {canDeleteActivo && (
                                            <button
                                                onClick={() => handleDeleteClick(activo.id)}
                                                className="text-red-600 hover:text-red-900 p-2 ml-2"
                                                title="Eliminar"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
                                    </td>
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

            <ActivoFormModal
                show={isModalOpen}
                onClose={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
                activoToEdit={currentActivo}
            />

            <ActivoDetailModal
                show={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                activo={selectedActivo}
                onActivoUpdate={() => {
                    fetchActivos(currentPage, pageSize);
                    // Update selectedActivo with fresh data
                    if (selectedActivo) {
                        const updatedActivo = activos.find(a => a.id === selectedActivo.id);
                        if (updatedActivo) {
                            setSelectedActivo(updatedActivo);
                        }
                    }
                }}
                onRetireClick={handleRetireClick}
                onReactivateClick={handleReactivateClick}
            />

            <RetireActivoModal
                show={isRetireModalOpen}
                onClose={() => {
                    setIsRetireModalOpen(false);
                    setActivoToRetire(null);
                }}
                activo={activoToRetire}
                onRetireSuccess={handleRetireSuccess}
            />

        </div>
    );
}

export default ActivosPage;