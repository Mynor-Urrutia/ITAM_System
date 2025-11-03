/**
 * Modal de Formulario para Tipos de Activo.
 *
 * Formulario simple para crear y editar tipos de activos tecnológicos.
 * Incluye validación básica y manejo de estados de carga.
 *
 * Características principales:
 * - Creación y edición de tipos de activo
 * - Validación de nombre obligatorio
 * - Descripción opcional
 * - Estados de carga y manejo de errores
 * - Diseño responsive y accesible
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';
import api from '../../api'; // Instancia corregida para producción

const TipoActivoFormModal = ({ show, onClose, onSaveSuccess, tipoActivoToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (tipoActivoToEdit) {
            setName(tipoActivoToEdit.name);
            setDescription(tipoActivoToEdit.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [tipoActivoToEdit, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('El nombre del tipo de activo no puede estar vacío.');
            return;
        }

        setIsLoading(true);
        try {
            const payload = { name, description };
            if (tipoActivoToEdit) {
	        // Change from axios.put to api.put
	        await api.put(`masterdata/tipos-activos/${tipoActivoToEdit.id}/`, payload); 
	        toast.success('Tipo de activo actualizado exitosamente!');
	    } else {
	        // Change from axios.post to api.post
	        await api.post('masterdata/tipos-activos/', payload); 
       		toast.success('Tipo de activo creado exitosamente!');
	    }
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving tipo de activo:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.name?.[0] || error.response?.data?.detail || 'Error desconocido al guardar el tipo de activo.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={tipoActivoToEdit ? 'Editar Tipo de Activo' : 'Crear Nuevo Tipo de Activo'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="tipoActivoName" className="block text-sm font-medium text-gray-700">Nombre del Tipo de Activo</label>
                    <input
                        type="text"
                        id="tipoActivoName"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="tipoActivoDescription" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                    <textarea
                        id="tipoActivoDescription"
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
                        {isLoading ? 'Guardando...' : (tipoActivoToEdit ? 'Actualizar' : 'Crear')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TipoActivoFormModal;
