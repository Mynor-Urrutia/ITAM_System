// C:\Proyectos\ITAM_System\itam_frontend\src\pages\masterdata\FincaFormModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api'; // Use the correct global instance
//import axios from '../../axiosConfig'; // Asegúrate de que esta ruta sea correcta
import Modal from '../../components/Modal'; // Asegúrate de que esta ruta sea correcta

const FincaFormModal = ({ show, onClose, onSaveSuccess, fincaToEdit, regions }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [regionId, setRegionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (fincaToEdit) {
            setName(fincaToEdit.name);
            setAddress(fincaToEdit.address || '');
            setRegionId(fincaToEdit.region || ''); // Asegúrate de que sea el ID de la región
        } else {
            setName('');
            setAddress('');
            setRegionId('');
        }
    }, [fincaToEdit, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('El nombre de la finca no puede estar vacío.');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                name,
                address,
                region: regionId || null, // Envía null si no hay región seleccionada
            };

            if (fincaToEdit) {
                // Actualizar finca existente
                await api.put(`masterdata/fincas/${fincaToEdit.id}/`, payload); // <--- CAMBIO AQUÍ
                toast.success('Finca actualizada exitosamente!');
            } else {
                // Crear nueva finca
                await api.post('masterdata/fincas/', payload); // <--- CAMBIO AQUÍ
                toast.success('Finca creada exitosamente!');
            }
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving finca:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.name?.[0] || error.response?.data?.detail || 'Error desconocido al guardar la finca.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={fincaToEdit ? 'Editar Finca' : 'Crear Nueva Finca'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fincaName" className="block text-sm font-medium text-gray-700">Nombre de la Finca</label>
                    <input
                        type="text"
                        id="fincaName"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="fincaAddress" className="block text-sm font-medium text-gray-700">Dirección</label>
                    <input
                        type="text"
                        id="fincaAddress"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="fincaRegion" className="block text-sm font-medium text-gray-700">Región</label>
                    <select
                        id="fincaRegion"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={regionId}
                        onChange={(e) => setRegionId(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="">-- Sin Región --</option>
                        {regions.map(region => (
                            <option key={region.id} value={region.id}>{region.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Guardando...' : (fincaToEdit ? 'Actualizar Finca' : 'Crear Finca')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default FincaFormModal;
