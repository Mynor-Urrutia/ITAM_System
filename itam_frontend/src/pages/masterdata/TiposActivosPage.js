// C:\Proyectos\ITAM_System\itam_frontend\src\pages\masterdata\TiposActivosPage.js
import React, { useState, useEffect } from 'react';
import { getTiposActivos, deleteTipoActivo } from '../../api'; // Make sure to import the correct API functions
import TipoActivoFormModal from './TipoActivoFormModal'; // Make sure to import your modal component
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../components/Pagination';

function TiposActivosPage() {
    const [tiposActivos, setTiposActivos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTipoActivo, setCurrentTipoActivo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { hasPermission } = useAuth();

    // Define the permission variables
    const canAddTipoActivo = hasPermission('masterdata.add_tipoactivo');
    const canChangeTipoActivo = hasPermission('masterdata.change_tipoactivo');
    const canDeleteTipoActivo = hasPermission('masterdata.delete_tipoactivo');

    useEffect(() => {
        fetchTiposActivos(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const fetchTiposActivos = async (page = 1, size = 5) => {
        try {
            const response = await getTiposActivos({ page, page_size: size });
            setTiposActivos(response.data.results);
            setTotalCount(response.data.count);
            setTotalPages(Math.ceil(response.data.count / size));
        } catch (error) {
            console.error('Error fetching tipos de activos:', error);
            toast.error('Error al cargar los tipos de activos.');
        }
    };

    const handleAddClick = () => {
        setCurrentTipoActivo(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (tipoActivo) => {
        setCurrentTipoActivo(tipoActivo);
        setIsModalOpen(true);
    };

    // Define the handleDeleteClick function
    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este tipo de activo?')) {
            return;
        }
        try {
            await deleteTipoActivo(id);
            toast.success('Tipo de activo eliminado correctamente.');
            fetchTiposActivos();
        } catch (error) {
            console.error('Error deleting tipo de activo:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || 'Error al eliminar el tipo de activo.';
            toast.error(errorMessage);
        }
    };

    const handleSaveSuccess = () => {
        fetchTiposActivos(currentPage, pageSize);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTipoActivo(null);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Tipos de Activos</h1>

            <div className="flex justify-end mb-4">
                {canAddTipoActivo && (
                    <button
                        onClick={handleAddClick}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Crear Nuevo Tipo de Activo
                    </button>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descripción
                            </th>
                            {(canChangeTipoActivo || canDeleteTipoActivo) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tiposActivos.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeTipoActivo || canDeleteTipoActivo) ? 3 : 2} className="px-6 py-4 text-center text-gray-500">
                                    No hay tipos de activos disponibles.
                                </td>
                            </tr>
                        ) : (
                            tiposActivos.map((tipoActivo) => (
                                <tr key={tipoActivo.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {tipoActivo.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {tipoActivo.description || 'N/A'}
                                    </td>
                                    {(canChangeTipoActivo || canDeleteTipoActivo) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {canChangeTipoActivo && (
                                                <button
                                                    onClick={() => handleEditClick(tipoActivo)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                            {canDeleteTipoActivo && (
                                                <button
                                                    onClick={() => handleDeleteClick(tipoActivo.id)}
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

            <TipoActivoFormModal
                show={isModalOpen}
                onClose={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
                tipoActivoToEdit={currentTipoActivo}
            />
        </div>
    );
}

export default TiposActivosPage;