// itam_frontend/src/pages/masterdata/RegionsPage.js
import React, { useState, useEffect } from 'react';
import { getRegions, deleteRegion } from '../../api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import RegionFormModal from './RegionFormModal'; // Importa el nuevo componente del modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../components/Pagination';

function RegionsPage() {
    const [regions, setRegions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // Nuevo estado para controlar la visibilidad del modal
    const [regionToEdit, setRegionToEdit] = useState(null); // Nuevo estado para la región a editar
    const { hasPermission } = useAuth();

    const canAddRegion = hasPermission('masterdata.add_region');
    const canChangeRegion = hasPermission('masterdata.change_region');
    const canDeleteRegion = hasPermission('masterdata.delete_region');
    const pageSizeOptions = [5, 10, 25, 50, 100, 200];

    useEffect(() => {
        fetchRegions();
    }, [currentPage, pageSize]);

    const fetchRegions = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize
            };
            const response = await getRegions(params);
            setRegions(response.data.results || response.data);
            setTotalPages(Math.ceil((response.data.count || response.data.length) / pageSize));
            setTotalCount(response.data.count || response.data.length);
        } catch (error) {
            console.error('Error fetching regions:', error);
            toast.error('Error al cargar las regiones.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleEditClick = (region) => {
        setRegionToEdit(region);
        setShowModal(true);
    };

    const handleCreateClick = () => {
        setRegionToEdit(null); // Asegúrate de que no haya ninguna región para editar
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setRegionToEdit(null); // Limpia la región a editar al cerrar el modal
    };

    const handleSaveSuccess = () => {
        fetchRegions(); // Refresca la lista después de guardar con éxito
    };

    const handleDeleteRegion = async (regionId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta región? Si tiene fincas asignadas, no se podrá eliminar.')) {
            return;
        }
        try {
            await deleteRegion(regionId);
            toast.success('Región eliminada exitosamente!');
            fetchRegions();
        } catch (error) {
            console.error('Error deleting region:', error.response?.data || error.message);
            if (error.response && error.response.status === 400 && error.response.data && error.response.data.detail) {
                toast.error(error.response.data.detail);
            } else {
                toast.error('Error al eliminar la región. Inténtelo de nuevo.');
            }
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestión de Regiones</h1>

            <div className="flex justify-end mb-4">
                {canAddRegion && (
                    <button
                        onClick={handleCreateClick}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Crear Nueva Región
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
                            {(canChangeRegion || canDeleteRegion) && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {regions.length === 0 ? (
                            <tr>
                                <td colSpan={(canChangeRegion || canDeleteRegion) ? 3 : 2} className="px-6 py-4 text-center text-gray-500">
                                    No hay regiones disponibles.
                                </td>
                            </tr>
                        ) : (
                            regions.map((region) => (
                                <tr key={region.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {region.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {region.description || 'N/A'}
                                    </td>
                                    {(canChangeRegion || canDeleteRegion) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {canChangeRegion && (
                                                <button
                                                    onClick={() => handleEditClick(region)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2"
                                                    title="Editar"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            )}
                                            {canDeleteRegion && (
                                                <button
                                                    onClick={() => handleDeleteRegion(region.id)}
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

            {/* El Modal para crear/editar regiones */}
            <RegionFormModal
                show={showModal}
                onClose={handleModalClose}
                onSaveSuccess={handleSaveSuccess}
                regionToEdit={regionToEdit}
            />
        </div>
    );
}

export default RegionsPage;