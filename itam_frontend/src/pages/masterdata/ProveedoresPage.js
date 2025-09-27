// itam_frontend/src/pages/masterdata/ProveedoresPage.js

import React, { useState, useEffect } from 'react';
import { getProveedores, deleteProveedor } from '../../api';
import ProveedorFormModal from './ProveedorFormModal';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../components/Pagination';

function ProveedoresPage() {
    const [proveedores, setProveedores] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProveedor, setCurrentProveedor] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { hasPermission } = useAuth();

    const canAddProveedor = hasPermission('masterdata.add_proveedor');
    const canChangeProveedor = hasPermission('masterdata.change_proveedor');
    const canDeleteProveedor = hasPermission('masterdata.delete_proveedor');

    useEffect(() => {
        fetchProveedores(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const fetchProveedores = async (page = 1, size = 5) => {
        try {
            const response = await getProveedores({ page, page_size: size });
            setProveedores(response.data.results);
            setTotalCount(response.data.count);
            setTotalPages(Math.ceil(response.data.count / size));
        } catch (error) {
            console.error('Error fetching proveedores:', error);
            toast.error('Error al cargar los proveedores.');
        }
    };

    const handleAddClick = () => {
        setCurrentProveedor(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (proveedor) => {
        setCurrentProveedor(proveedor);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
            return;
        }
        try {
            await deleteProveedor(id);
            toast.success('Proveedor eliminado correctamente.');
            fetchProveedores(currentPage, pageSize);
        } catch (error) {
            console.error('Error deleting proveedor:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || 'Error al eliminar el proveedor.';
            toast.error(errorMessage);
        }
    };

    const handleSaveSuccess = () => {
        fetchProveedores(currentPage, pageSize);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProveedor(null);
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
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Proveedores</h1>

            <div className="flex justify-end mb-4">
                {canAddProveedor && (
                    <button
                        onClick={handleAddClick}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Crear Nuevo Proveedor
                    </button>
                )}
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Empresa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                NIT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contacto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Teléfono Ventas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Correo Ventas
                            </th>
                            {(canChangeProveedor || canDeleteProveedor) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {proveedores.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeProveedor || canDeleteProveedor) ? 6 : 5} className="px-6 py-4 text-center text-gray-500">
                                    No hay proveedores disponibles.
                                </td>
                            </tr>
                        ) : (
                            proveedores.map((proveedor) => (
                                <tr key={proveedor.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {proveedor.nombre_empresa}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {proveedor.nit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {proveedor.nombre_contacto}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {proveedor.telefono_ventas || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {proveedor.correo_ventas || 'N/A'}
                                    </td>
                                    {(canChangeProveedor || canDeleteProveedor) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {canChangeProveedor && (
                                                <button
                                                    onClick={() => handleEditClick(proveedor)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                            {canDeleteProveedor && (
                                                <button
                                                    onClick={() => handleDeleteClick(proveedor.id)}
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

            <ProveedorFormModal
                show={isModalOpen}
                onClose={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
                proveedorToEdit={currentProveedor}
            />
        </div>
    );
}

export default ProveedoresPage;