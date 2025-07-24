// itam_frontend/src/pages/masterdata/FarmsPage.js
import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

function FarmsPage() {
    const [fincas, setFincas] = useState([]);
    const [regions, setRegions] = useState([]);
    const [newFincaName, setNewFincaName] = useState('');
    const [newFincaAddress, setNewFincaAddress] = useState('');
    const [newFincaRegionId, setNewFincaRegionId] = useState('');
    const [editingFinca, setEditingFinca] = useState(null);
    const { hasPermission } = useAuth();

    const canAddFinca = hasPermission('masterdata.add_finca');
    const canChangeFinca = hasPermission('masterdata.change_finca');
    const canDeleteFinca = hasPermission('masterdata.delete_finca');

    useEffect(() => {
        fetchFincas();
        fetchRegions();
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
        }
    };

    const handleCreateFinca = async (e) => {
        e.preventDefault();
        if (!newFincaName.trim()) {
            toast.error('El nombre de la finca no puede estar vacío.');
            return;
        }

        try {
            const payload = {
                name: newFincaName,
                address: newFincaAddress,
                region: newFincaRegionId || null,
            };
            await axios.post('masterdata/fincas/', payload); // Ya no necesitamos 'response' directamente aquí
            setNewFincaName('');
            setNewFincaAddress('');
            setNewFincaRegionId('');
            toast.success('Finca creada exitosamente!');
            // --- ¡NUEVO! Volver a cargar todas las fincas para actualizar la tabla ---
            fetchFincas();
            // -------------------------------------------------------------------------
        } catch (error) {
            console.error('Error creating finca:', error.response?.data || error.message);
            toast.error('Error al crear la finca: ' + (error.response?.data?.name || 'Error desconocido'));
        }
    };

    const handleUpdateFinca = async (e) => {
        e.preventDefault();
        if (!editingFinca.name.trim()) {
            toast.error('El nombre de la finca no puede estar vacío.');
            return;
        }

        try {
            const payload = {
                name: editingFinca.name,
                address: editingFinca.address,
                region: editingFinca.region || null,
            };
            await axios.put(`masterdata/fincas/${editingFinca.id}/`, payload); // Ya no necesitamos 'response' directamente aquí
            setEditingFinca(null);
            toast.success('Finca actualizada exitosamente!');
            // --- ¡NUEVO! Volver a cargar todas las fincas para actualizar la tabla ---
            fetchFincas();
            // -------------------------------------------------------------------------
        } catch (error) {
            console.error('Error updating finca:', error.response?.data || error.message);
            toast.error('Error al actualizar la finca: ' + (error.response?.data?.name || 'Error desconocido'));
        }
    };

    const handleDeleteFinca = async (fincaId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta finca?')) {
            return;
        }
        try {
            await axios.delete(`masterdata/fincas/${fincaId}/`);
            toast.success('Finca eliminada exitosamente!');
            // --- ¡NUEVO! Volver a cargar todas las fincas para actualizar la tabla ---
            fetchFincas();
            // -------------------------------------------------------------------------
        } catch (error) {
            console.error('Error deleting finca:', error.response?.data || error.message);
            toast.error('Error al eliminar la finca.');
        }
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Fincas</h1>

            {canAddFinca && (
                <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">{editingFinca ? 'Editar Finca' : 'Crear Nueva Finca'}</h2>
                    <form onSubmit={editingFinca ? handleUpdateFinca : handleCreateFinca} className="space-y-4">
                        <div>
                            <label htmlFor="fincaName" className="block text-sm font-medium text-gray-700">Nombre de la Finca</label>
                            <input
                                type="text"
                                id="fincaName"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={editingFinca ? editingFinca.name : newFincaName}
                                onChange={(e) => editingFinca ? setEditingFinca({ ...editingFinca, name: e.target.value }) : setNewFincaName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="fincaAddress" className="block text-sm font-medium text-gray-700">Dirección</label>
                            <input
                                type="text"
                                id="fincaAddress"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={editingFinca ? editingFinca.address || '' : newFincaAddress}
                                onChange={(e) => editingFinca ? setEditingFinca({ ...editingFinca, address: e.target.value }) : setNewFincaAddress(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="fincaRegion" className="block text-sm font-medium text-gray-700">Región</label>
                            <select
                                id="fincaRegion"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                value={editingFinca ? (editingFinca.region || '') : newFincaRegionId}
                                onChange={(e) => editingFinca ? setEditingFinca({ ...editingFinca, region: e.target.value || null }) : setNewFincaRegionId(e.target.value)}
                            >
                                <option value="">-- Sin Región --</option>
                                {regions.map(region => (
                                    <option key={region.id} value={region.id}>{region.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {editingFinca ? 'Actualizar Finca' : 'Crear Finca'}
                            </button>
                            {editingFinca && (
                                <button
                                    type="button"
                                    onClick={() => setEditingFinca(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
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
                                                    onClick={() => setEditingFinca({ ...finca, region: finca.region || '' })}
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
        </div>
    );
}

export default FarmsPage;