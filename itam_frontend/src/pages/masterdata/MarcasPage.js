// itam_frontend/src/pages/masterdata/MarcasPage.js

import React, { useState, useEffect } from 'react';
import { getMarcas, deleteMarca } from '../../api';
import MarcaFormModal from './MarcaFormModal';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

function MarcasPage() {
    const [marcas, setMarcas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMarca, setCurrentMarca] = useState(null);
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    return (
        <div className="p-4">
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
        </div>
    );
}

export default MarcasPage;