// itam_frontend/src/pages/masterdata/FarmsPage.js
import React, { useState, useEffect } from 'react';
import { getFincas, getRegions, deleteFinca } from '../../api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import FincaFormModal from './FincaFormModal'; // Importa el nuevo componente del modal
import Pagination from '../../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

function FarmsPage() {
    const [fincas, setFincas] = useState([]);
    const [regions, setRegions] = useState([]); // Necesitamos las regiones para el select en el modal
    const [showModal, setShowModal] = useState(false); // Nuevo estado para controlar la visibilidad del modal
    const [fincaToEdit, setFincaToEdit] = useState(null); // Nuevo estado para la finca a editar

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSizeOptions = [5, 10, 25, 50, 100, 200];

    const { hasPermission } = useAuth();

    const canAddFinca = hasPermission('masterdata.add_finca');
    const canChangeFinca = hasPermission('masterdata.change_finca');
    const canDeleteFinca = hasPermission('masterdata.delete_finca');

    useEffect(() => {
        fetchFincas();
        fetchRegions();
    }, [currentPage, pageSize]);

    const fetchFincas = async () => {
        try {
            const params = {
                page: currentPage,
                page_size: pageSize
            };
            const response = await getFincas(params);
            setFincas(response.data.results || response.data);
            setTotalPages(Math.ceil((response.data.count || response.data.length) / pageSize));
            setTotalCount(response.data.count || response.data.length);
        } catch (error) {
            console.error('Error fetching fincas:', error);
            toast.error('Error al cargar las fincas.');
        }
    };

    const fetchRegions = async () => {
        try {
            const response = await getRegions();
            setRegions(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching regions:', error);
            // No es crítico si no se cargan las regiones, solo el select estará vacío
        }
    };

    const handleEditClick = (finca) => {
        setFincaToEdit(finca);
        setShowModal(true);
    };

    const handleCreateClick = () => {
        setFincaToEdit(null);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setFincaToEdit(null);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleSaveSuccess = () => {
        fetchFincas(); // Refresca la lista de fincas
    };

    const handleDeleteFinca = async (fincaId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta finca?')) {
            return;
        }
        try {
            await deleteFinca(fincaId);
            toast.success('Finca eliminada exitosamente!');
            fetchFincas();
        } catch (error) {
            console.error('Error deleting finca:', error.response?.data || error.message);
            // Aquí podrías añadir un manejo específico si una finca no se puede eliminar por dependencias futuras
            toast.error('Error al eliminar la finca. Inténtelo de nuevo.');
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Fincas</h1>

            <div className="flex justify-end mb-4">
                {canAddFinca && (
                    <button
                        onClick={handleCreateClick}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Crear Nueva Finca
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
                                Región
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dirección
                            </th>
                            {(canChangeFinca || canDeleteFinca) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {fincas.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeFinca || canDeleteFinca) ? 4 : 3} className="px-6 py-4 text-center text-gray-500">
                                    No hay fincas disponibles.
                                </td>
                            </tr>
                        ) : (
                            fincas.map((finca) => (
                                <tr key={finca.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {finca.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {finca.region_name || 'Sin asignar'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {finca.address || 'N/A'}
                                    </td>
                                    {(canChangeFinca || canDeleteFinca) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {canChangeFinca && (
                                                <button
                                                    onClick={() => handleEditClick(finca)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                            {canDeleteFinca && (
                                                <button
                                                    onClick={() => handleDeleteFinca(finca.id)}
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

            {/* Pagination Component */}
            {totalCount > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    pageSizeOptions={pageSizeOptions}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            {/* El Modal para crear/editar fincas */}
            <FincaFormModal
                show={showModal}
                onClose={handleModalClose}
                onSaveSuccess={handleSaveSuccess}
                fincaToEdit={fincaToEdit}
                regions={regions} // Pasa las regiones al modal para el select
            />
        </div>
    );
}

export default FarmsPage;