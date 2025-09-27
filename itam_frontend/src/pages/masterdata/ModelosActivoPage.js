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
import { faPlus, faEdit, faTrash, faLaptop } from '@fortawesome/free-solid-svg-icons';

function ModelosActivoPage() {
    const [modelos, setModelos] = useState([]);
    const [marcas, setMarcas] = useState([]); // Datos para el formulario
    const [tiposActivo, setTiposActivo] = useState([]); // Datos para el formulario
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [currentModelo, setCurrentModelo] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

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
        <div className="p-4">
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

            <div className="bg-white shadow overflow-hidden rounded-lg">
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
                    modelo={currentModelo}
                    onClose={closeModal}
                    onSave={() => fetchModelos(currentPage, pageSize)}
                    marcas={marcas}
                    tiposActivo={tiposActivo}
                />
            </Modal>
        </div>
    );
}

export default ModelosActivoPage;