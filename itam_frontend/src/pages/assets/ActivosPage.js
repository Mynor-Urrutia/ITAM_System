// itam_frontend/src/pages/assets/ActivosPage.js

import React, { useState, useEffect } from 'react';
import { getActivos, deleteActivo } from '../../api';
import ActivoFormModal from './ActivoFormModal';
import ActivoDetailModal from './ActivoDetailModal';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

function ActivosPage() {
    const [activos, setActivos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentActivo, setCurrentActivo] = useState(null);
    const [selectedActivo, setSelectedActivo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { hasPermission } = useAuth();

    const canAddActivo = hasPermission('masterdata.add_activo');
    const canChangeActivo = hasPermission('masterdata.change_activo');
    const canDeleteActivo = hasPermission('masterdata.delete_activo');

    useEffect(() => {
        fetchActivos(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const fetchActivos = async (page = 1, size = 5) => {
        try {
            const response = await getActivos({ page, page_size: size });
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

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Activos</h1>

            <div className="flex justify-end mb-4">
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
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hostname
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Serie
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo de Equipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Marca
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Modelo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha Venc. Garantía
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado Garantía
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Región
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Finca
                            </th>
                            {(canChangeActivo || canDeleteActivo) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activos.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeActivo || canDeleteActivo) ? 10 : 9} className="px-6 py-4 text-center text-gray-500">
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
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button
                                            onClick={() => handleViewClick(activo)}
                                            className="text-blue-600 hover:text-blue-900 p-2"
                                            title="Ver Detalles"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                        {canChangeActivo && (
                                            <button
                                                onClick={() => handleEditClick(activo)}
                                                className="text-indigo-600 hover:text-indigo-900 p-2 ml-2"
                                                title="Editar"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
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
            />
        </div>
    );
}

export default ActivosPage;