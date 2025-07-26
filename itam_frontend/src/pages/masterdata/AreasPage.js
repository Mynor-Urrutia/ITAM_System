// C:\Proyectos\ITAM_System\itam_frontend\src\pages\masterdata\AreasPage.js
import React, { useState, useEffect } from 'react';
import { getAreas, deleteArea } from '../../api'; // Importa las funciones API
import AreaFormModal from './AreaFormModal'; // Importa el modal del formulario
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // Para permisos

function AreasPage() {
    const [areas, setAreas] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentArea, setCurrentArea] = useState(null); // Para editar
    const { hasPermission } = useAuth();

    const canAddArea = hasPermission('masterdata.add_area');
    const canChangeArea = hasPermission('masterdata.change_area');
    const canDeleteArea = hasPermission('masterdata.delete_area');

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        try {
            const response = await getAreas();
            setAreas(response.data);
        } catch (error) {
            console.error('Error fetching areas:', error);
            toast.error('Error al cargar las áreas.');
        }
    };

    const handleAddClick = () => {
        setCurrentArea(null); // Para formulario de creación
        setIsModalOpen(true);
    };

    const handleEditClick = (area) => {
        setCurrentArea(area); // Para formulario de edición
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta área?')) {
            return;
        }
        try {
            await deleteArea(id);
            toast.success('Área eliminada correctamente.');
            fetchAreas(); // Refrescar la lista
        } catch (error) {
            console.error('Error deleting area:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || 'Error al eliminar el área.';
            toast.error(errorMessage);
        }
    };

    const handleSaveSuccess = () => {
        fetchAreas(); // Refresca la lista después de guardar/actualizar
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentArea(null); // Limpia el estado de edición al cerrar
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Áreas</h1>

            {canAddArea && (
                <div className="mb-8">
                    <button
                        onClick={handleAddClick}
                        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Crear Nueva Área
                    </button>
                </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Listado de Áreas</h2>
            {areas.length === 0 ? (
                <p className="text-gray-600">No hay áreas disponibles.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Nombre</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Departamento</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Descripción</th>
                                {(canChangeArea || canDeleteArea) && <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {areas.map((area) => (
                                <tr key={area.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-800">{area.id}</td>
                                    <td className="py-3 px-4 text-gray-800">{area.name}</td>
                                    <td className="py-3 px-4 text-gray-800">{area.departamento_name}</td> {/* Nombre del departamento */}
                                    <td className="py-3 px-4 text-gray-800">{area.description || 'N/A'}</td>
                                    {(canChangeArea || canDeleteArea) && (
                                        <td className="py-3 px-4">
                                            {canChangeArea && (
                                                <button
                                                    onClick={() => handleEditClick(area)}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 mr-2"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                            {canDeleteArea && (
                                                <button
                                                    onClick={() => handleDeleteClick(area.id)}
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

            <AreaFormModal
                show={isModalOpen}
                onClose={handleCloseModal}
                onSaveSuccess={handleSaveSuccess}
                areaToEdit={currentArea}
            />
        </div>
    );
}

export default AreasPage;