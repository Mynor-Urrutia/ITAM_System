// itam_frontend/src/pages/masterdata/RegionsPage.js
import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import RegionFormModal from './RegionFormModal'; // Importa el nuevo componente del modal

function RegionsPage() {
    const [regions, setRegions] = useState([]);
    const [showModal, setShowModal] = useState(false); // Nuevo estado para controlar la visibilidad del modal
    const [regionToEdit, setRegionToEdit] = useState(null); // Nuevo estado para la región a editar
    const { hasPermission } = useAuth();

    const canAddRegion = hasPermission('masterdata.add_region');
    const canChangeRegion = hasPermission('masterdata.change_region');
    const canDeleteRegion = hasPermission('masterdata.delete_region');

    useEffect(() => {
        fetchRegions();
    }, []);

    const fetchRegions = async () => {
        try {
            const response = await axios.get('masterdata/regions/');
            setRegions(response.data);
        } catch (error) {
            console.error('Error fetching regions:', error);
            toast.error('Error al cargar las regiones.');
        }
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
            await axios.delete(`masterdata/regions/${regionId}/`);
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
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Regiones</h1>

            {canAddRegion && (
                <div className="mb-8">
                    <button
                        onClick={handleCreateClick}
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Crear Nueva Región
                    </button>
                </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Listado de Regiones</h2>
            {regions.length === 0 ? (
                <p className="text-gray-600">No hay regiones disponibles.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Nombre</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Descripción</th>
                                {(canChangeRegion || canDeleteRegion) && <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {regions.map((region) => (
                                <tr key={region.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-800">{region.name}</td>
                                    <td className="py-3 px-4 text-gray-800">{region.description || 'N/A'}</td>
                                    {(canChangeRegion || canDeleteRegion) && (
                                        <td className="py-3 px-4">
                                            {canChangeRegion && (
                                                <button
                                                    onClick={() => handleEditClick(region)}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 mr-2"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                            {canDeleteRegion && (
                                                <button
                                                    onClick={() => handleDeleteRegion(region.id)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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