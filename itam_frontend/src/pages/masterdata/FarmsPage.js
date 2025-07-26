// itam_frontend/src/pages/masterdata/FarmsPage.js
import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import FincaFormModal from './FincaFormModal'; // Importa el nuevo componente del modal

function FarmsPage() {
    const [fincas, setFincas] = useState([]);
    const [regions, setRegions] = useState([]); // Necesitamos las regiones para el select en el modal
    const [showModal, setShowModal] = useState(false); // Nuevo estado para controlar la visibilidad del modal
    const [fincaToEdit, setFincaToEdit] = useState(null); // Nuevo estado para la finca a editar
    const { hasPermission } = useAuth();

    const canAddFinca = hasPermission('masterdata.add_finca');
    const canChangeFinca = hasPermission('masterdata.change_finca');
    const canDeleteFinca = hasPermission('masterdata.delete_finca');

    useEffect(() => {
        fetchFincas();
        fetchRegions(); // Asegúrate de cargar las regiones
    }, []);

    const fetchFincas = async () => {
        try {
            const response = await axios.get('masterdata/fincas/');
            setFincas(response.data);
        } catch (error) {
            console.error('Error fetching fincas:', error);
            toast.error('Error al cargar las fincas.');
        }
    };

    const fetchRegions = async () => {
        try {
            const response = await axios.get('masterdata/regions/');
            setRegions(response.data);
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

    const handleSaveSuccess = () => {
        fetchFincas(); // Refresca la lista de fincas
    };

    const handleDeleteFinca = async (fincaId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta finca?')) {
            return;
        }
        try {
            await axios.delete(`masterdata/fincas/${fincaId}/`);
            toast.success('Finca eliminada exitosamente!');
            fetchFincas();
        } catch (error) {
            console.error('Error deleting finca:', error.response?.data || error.message);
            // Aquí podrías añadir un manejo específico si una finca no se puede eliminar por dependencias futuras
            toast.error('Error al eliminar la finca. Inténtelo de nuevo.');
        }
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Fincas</h1>

            {canAddFinca && (
                <div className="mb-8">
                    <button
                        onClick={handleCreateClick}
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Crear Nueva Finca
                    </button>
                </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Listado de Fincas</h2>
            {fincas.length === 0 ? (
                <p className="text-gray-600">No hay fincas disponibles.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Nombre</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Región</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Dirección</th>
                                {(canChangeFinca || canDeleteFinca) && <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {fincas.map((finca) => (
                                <tr key={finca.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-800">{finca.name}</td>
                                    <td className="py-3 px-4 text-gray-800">{finca.region_name || 'Sin asignar'}</td>
                                    <td className="py-3 px-4 text-gray-800">{finca.address || 'N/A'}</td>
                                    {(canChangeFinca || canDeleteFinca) && (
                                        <td className="py-3 px-4">
                                            {canChangeFinca && (
                                                <button
                                                    onClick={() => handleEditClick(finca)}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 mr-2"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                            {canDeleteFinca && (
                                                <button
                                                    onClick={() => handleDeleteFinca(finca.id)}
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