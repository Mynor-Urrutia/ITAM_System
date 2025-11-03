/**
 * Modal de Selección de Activos para Asignación.
 *
 * Interfaz para seleccionar activos disponibles y asignarlos a empleados.
 * Incluye búsqueda, filtrado, ordenamiento y selección múltiple de activos
 * con vista previa antes de la asignación final.
 *
 * Características principales:
 * - Lista paginada de activos disponibles (no asignados)
 * - Búsqueda en tiempo real por hostname, serie, tipo, marca, modelo
 * - Selección múltiple con checkboxes
 * - Ordenamiento por columnas
 * - Vista dual: cards móviles / tabla desktop
 * - Integración con AssignmentFormModal para edición de especificaciones
 * - Estados de carga y manejo de errores
 */

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { getAvailableAssets } from '../../api';
import AssignmentFormModal from './AssignmentFormModal';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const AssignmentModal = ({ show, onClose, selectedEmployee, onAssignmentSuccess }) => {
    const [availableAssets, setAvailableAssets] = useState([]);
    const [selectedAssets, setSelectedAssets] = useState(new Set());
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Search and sort states
    const [searchText, setSearchText] = useState('');
    const [sortField, setSortField] = useState('hostname');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        if (show && selectedEmployee) {
            fetchAvailableAssets();
        }
    }, [show, selectedEmployee, currentPage, pageSize, searchText, sortField, sortDirection]);

    const fetchAvailableAssets = async (page = 1, size = 10) => {
        if (!selectedEmployee) return;

        try {
            const params = {
                page,
                page_size: size,
                search: searchText.trim() || undefined,
                ordering: sortDirection === 'desc' ? `-${sortField}` : sortField
            };

            const response = await getAvailableAssets(params);
            setAvailableAssets(response.data.results);
            setTotalCount(response.data.count);
            setTotalPages(Math.ceil(response.data.count / size));
        } catch (error) {
            console.error('Error fetching available assets:', error);
            toast.error('Error al cargar los activos disponibles.');
        }
    };

    const handleAssetSelect = (assetId) => {
        const newSelected = new Set(selectedAssets);
        if (newSelected.has(assetId)) {
            newSelected.delete(assetId);
        } else {
            newSelected.add(assetId);
        }
        setSelectedAssets(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedAssets.size === availableAssets.length) {
            setSelectedAssets(new Set());
        } else {
            setSelectedAssets(new Set(availableAssets.map(asset => asset.id)));
        }
    };

    const handleAssignClick = () => {
        if (selectedAssets.size === 0) {
            toast.warning('Selecciona al menos un activo para asignar.');
            return;
        }
        setIsFormModalOpen(true);
    };

    const handleAssignmentSuccess = () => {
        setIsFormModalOpen(false);
        setSelectedAssets(new Set());
        onAssignmentSuccess();
        onClose();
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (field) => {
        if (sortField !== field) {
            return faSort;
        }
        return sortDirection === 'asc' ? faSortUp : faSortDown;
    };

    if (!selectedEmployee) return null;

    return (
        <>
            <Modal show={show && !isFormModalOpen} onClose={onClose} title="Asignar Activos" size="xl">
                <div className="space-y-4">
                    {/* Employee Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Empleado</h3>
                        <p className="text-blue-700">
                            {selectedEmployee.first_name} {selectedEmployee.last_name} ({selectedEmployee.employee_number})
                        </p>
                    </div>

                    {/* Available Assets Section */}
                    <div className="bg-white border rounded-lg">
                        <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                            <h3 className="text-lg font-medium text-gray-900">
                                Activos Disponibles
                            </h3>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                                {/* Search */}
                                <div className="relative w-full sm:w-auto">
                                    <input
                                        type="text"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        className="pl-8 pr-3 py-1 border border-gray-300 rounded text-sm w-full"
                                        placeholder="Buscar activos..."
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Select All and Assign Button */}
                                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
                                    {availableAssets.length > 0 && (
                                        <button
                                            onClick={handleSelectAll}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            {selectedAssets.size === availableAssets.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                        </button>
                                    )}

                                    {selectedAssets.size > 0 && (
                                        <button
                                            onClick={handleAssignClick}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
                                        >
                                            Asignar {selectedAssets.size} activo{selectedAssets.size !== 1 ? 's' : ''}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile cards */}
                        <div className="block sm:hidden">
                            {availableAssets.length === 0 ? (
                                <p className="px-4 py-4 text-center text-gray-500">
                                    No hay activos disponibles.
                                </p>
                            ) : (
                                <div className="space-y-4 p-4">
                                    {availableAssets.map((asset) => (
                                        <div key={asset.id} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-start space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAssets.has(asset.id)}
                                                    onChange={() => handleAssetSelect(asset.id)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{asset.hostname}</h3>
                                                    <p className="text-sm text-gray-600">Serie: {asset.serie}</p>
                                                    <p className="text-sm text-gray-600">Tipo: {asset.tipo_activo_name}</p>
                                                    <p className="text-sm text-gray-600">Marca: {asset.marca_name}</p>
                                                    <p className="text-sm text-gray-600">Modelo: {asset.modelo_name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={availableAssets.length > 0 && selectedAssets.size === availableAssets.length}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('hostname')}>
                                            <div className="flex items-center">
                                                Hostname
                                                <FontAwesomeIcon icon={getSortIcon('hostname')} className="ml-1 text-xs" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('serie')}>
                                            <div className="flex items-center">
                                                Serie
                                                <FontAwesomeIcon icon={getSortIcon('serie')} className="ml-1 text-xs" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('tipo_activo__name')}>
                                            <div className="flex items-center">
                                                Tipo
                                                <FontAwesomeIcon icon={getSortIcon('tipo_activo__name')} className="ml-1 text-xs" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('marca__name')}>
                                            <div className="flex items-center">
                                                Marca
                                                <FontAwesomeIcon icon={getSortIcon('marca__name')} className="ml-1 text-xs" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('modelo__name')}>
                                            <div className="flex items-center">
                                                Modelo
                                                <FontAwesomeIcon icon={getSortIcon('modelo__name')} className="ml-1 text-xs" />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {availableAssets.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                                                No hay activos disponibles.
                                            </td>
                                        </tr>
                                    ) : (
                                        availableAssets.map((asset) => (
                                            <tr key={asset.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAssets.has(asset.id)}
                                                        onChange={() => handleAssetSelect(asset.id)}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {asset.hostname}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {asset.serie}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {asset.tipo_activo_name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {asset.marca_name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {asset.modelo_name}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-200">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    pageSizeOptions={[5, 10, 20, 50]}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Assignment Form Modal */}
            <AssignmentFormModal
                show={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                selectedEmployee={selectedEmployee}
                selectedAssets={availableAssets.filter(asset => selectedAssets.has(asset.id))}
                onAssignmentSuccess={handleAssignmentSuccess}
            />
        </>
    );
};

export default AssignmentModal;