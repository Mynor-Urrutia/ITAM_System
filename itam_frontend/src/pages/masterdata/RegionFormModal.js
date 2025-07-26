// C:\Proyectos\ITAM_System\itam_frontend\src\pages\masterdata\RegionFormModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../axiosConfig'; // Asegúrate de que esta ruta sea correcta
import Modal from '../../components/Modal'; // Asegúrate de que esta ruta sea correcta

const RegionFormModal = ({ show, onClose, onSaveSuccess, regionToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (regionToEdit) {
            setName(regionToEdit.name);
            setDescription(regionToEdit.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [regionToEdit, show]); // Resetear cuando el modal se muestra o la región a editar cambia

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('El nombre de la región no puede estar vacío.');
            return;
        }

        setIsLoading(true);
        try {
            const payload = { name, description };
            if (regionToEdit) {
                // Actualizar región existente
                await axios.put(`masterdata/regions/${regionToEdit.id}/`, payload);
                toast.success('Región actualizada exitosamente!');
            } else {
                // Crear nueva región
                await axios.post('masterdata/regions/', payload);
                toast.success('Región creada exitosamente!');
            }
            onSaveSuccess(); // Llama a la función para refrescar la lista en el padre
            onClose(); // Cierra el modal
        } catch (error) {
            console.error('Error saving region:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.name?.[0] || error.response?.data?.detail || 'Error desconocido al guardar la región.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={regionToEdit ? 'Editar Región' : 'Crear Nueva Región'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="regionName" className="block text-sm font-medium text-gray-700">Nombre de la Región</label>
                    <input
                        type="text"
                        id="regionName"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="regionDescription" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                    <textarea
                        id="regionDescription"
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isLoading}
                    ></textarea>
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
                        {isLoading ? 'Guardando...' : (regionToEdit ? 'Actualizar Región' : 'Crear Región')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default RegionFormModal;