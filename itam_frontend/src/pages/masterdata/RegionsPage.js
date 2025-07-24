// itam_frontend/src/pages/masterdata/RegionsPage.js
import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

function RegionsPage() {
    const [regions, setRegions] = useState([]);
    const [newRegionName, setNewRegionName] = useState('');
    const [newRegionDescription, setNewRegionDescription] = useState('');
    const [editingRegion, setEditingRegion] = useState(null);
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

    // --- FUNCIONES QUE FALTABAN ---
    const handleCreateRegion = async (e) => {
        e.preventDefault();
        if (!newRegionName.trim()) {
            toast.error('El nombre de la región no puede estar vacío.');
            return;
        }

        try {
            await axios.post('masterdata/regions/', {
                name: newRegionName,
                description: newRegionDescription,
            });
            setNewRegionName('');
            setNewRegionDescription('');
            toast.success('Región creada exitosamente!');
            fetchRegions(); // Vuelve a cargar todas las regiones para actualizar la tabla
        } catch (error) {
            console.error('Error creating region:', error.response?.data || error.message);
            toast.error('Error al crear la región: ' + (error.response?.data?.name || 'Error desconocido'));
        }
    };

    const handleUpdateRegion = async (e) => {
        e.preventDefault();
        if (!editingRegion.name.trim()) {
            toast.error('El nombre de la región no puede estar vacío.');
            return;
        }

        try {
            await axios.put(`masterdata/regions/${editingRegion.id}/`, editingRegion);
            setEditingRegion(null);
            toast.success('Región actualizada exitosamente!');
            fetchRegions(); // Vuelve a cargar todas las regiones para actualizar la tabla
        } catch (error) {
            console.error('Error updating region:', error.response?.data || error.message);
            toast.error('Error al actualizar la región: ' + (error.response?.data?.name || 'Error desconocido'));
        }
    };
    // ----------------------------

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
                <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">{editingRegion ? 'Editar Región' : 'Crear Nueva Región'}</h2>
                    <form onSubmit={editingRegion ? handleUpdateRegion : handleCreateRegion} className="space-y-4">
                        <div>
                            <label htmlFor="regionName" className="block text-sm font-medium text-gray-700">Nombre de la Región</label>
                            <input
                                type="text"
                                id="regionName"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={editingRegion ? editingRegion.name : newRegionName}
                                onChange={(e) => editingRegion ? setEditingRegion({ ...editingRegion, name: e.target.value }) : setNewRegionName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="regionDescription" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                            <textarea
                                id="regionDescription"
                                rows="3"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={editingRegion ? editingRegion.description || '' : newRegionDescription}
                                onChange={(e) => editingRegion ? setEditingRegion({ ...editingRegion, description: e.target.value }) : setNewRegionDescription(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {editingRegion ? 'Actualizar Región' : 'Crear Región'}
                            </button>
                            {editingRegion && (
                                <button
                                    type="button"
                                    onClick={() => setEditingRegion(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
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
                                                    onClick={() => setEditingRegion(region)}
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
        </div>
    );
}

export default RegionsPage;