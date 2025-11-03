/**
 * Página de Gestión de Proveedores.
 *
 * Interfaz completa para administrar proveedores con información
 * detallada de contactos de ventas y soporte. Incluye gestión
 * CRUD completa con vistas duales y permisos granulares.
 *
 * Características principales:
 * - Gestión CRUD completa de proveedores
 * - Información completa de empresa y contactos
 * - Contactos separados para ventas y soporte
 * - Vista dual: cards móviles / tabla desktop
 * - Estados de carga y manejo de errores completo
 * - Diseño responsive con navegación intuitiva
 * - Permisos granulares basados en roles
 */

import React, { useState, useEffect } from 'react';
import { getProveedores, deleteProveedor } from '../../api';
import ProveedorFormModal from './ProveedorFormModal';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../components/Pagination';

function ProveedoresPage() {
    const [proveedores, setProveedores] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProveedor, setCurrentProveedor] = useState(null);
    const [expandedCards, setExpandedCards] = useState(new Set());
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

    const toggleCardExpansion = (proveedorId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(proveedorId)) {
            newExpanded.delete(proveedorId);
        } else {
            newExpanded.add(proveedorId);
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
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Gestión de Proveedores</h1>
                </div>

                {/* Search Box for Mobile */}
                <div className="mb-4">
                    <div className="relative">
                        <label htmlFor="search" className="sr-only">Buscar Proveedores</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Buscar proveedores..."
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
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
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
                {proveedores.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay proveedores disponibles.</p>
                ) : (
                    proveedores.map((proveedor) => {
                        const isExpanded = expandedCards.has(proveedor.id);
                        return (
                            <div key={proveedor.id} className="bg-white rounded-lg shadow border">
                                {/* Header - Always visible */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{proveedor.nombre_empresa}</h3>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">NIT:</span> {proveedor.nit}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Contacto:</span> {proveedor.nombre_contacto}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleCardExpansion(proveedor.id)}
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
                                                <span className="font-medium">Teléfono Ventas:</span> {proveedor.telefono_ventas || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Correo Ventas:</span> {proveedor.correo_ventas || 'N/A'}
                                            </p>
                                        </div>
                                        {(canChangeProveedor || canDeleteProveedor) && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {canChangeProveedor && (
                                                    <button
                                                        onClick={() => handleEditClick(proveedor)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                                                        title="Editar"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                                        Editar
                                                    </button>
                                                )}
                                                {canDeleteProveedor && (
                                                    <button
                                                        onClick={() => handleDeleteClick(proveedor.id)}
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

            {/* Mobile Floating Action Button */}
            {canAddProveedor && (
                <div className="block sm:hidden fixed bottom-6 right-6 z-10">
                    <button
                        onClick={handleAddClick}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                        title="Crear Nuevo Proveedor"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xl" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProveedoresPage;