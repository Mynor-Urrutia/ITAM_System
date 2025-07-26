// C:\Proyectos\ITAM_System\itam_frontend\src\pages\masterdata\DepartmentFormModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createDepartamento, updateDepartamento } from '../../api'; // Importa las funciones API
import Modal from '../../components/Modal'; // Importa tu Modal personalizado

const DepartmentFormModal = ({ show, onClose, onSaveSuccess, departamentoToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (departamentoToEdit) {
            setName(departamentoToEdit.name);
            setDescription(departamentoToEdit.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [departamentoToEdit, show]); // Resetear cuando el modal se muestra o el departamento a editar cambia

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('El nombre del departamento no puede estar vacío.');
            return;
        }

        setIsLoading(true);
        try {
            const payload = { name, description };
            if (departamentoToEdit) {
                // Actualizar departamento existente
                await updateDepartamento(departamentoToEdit.id, payload);
                toast.success('Departamento actualizado exitosamente!');
            } else {
                // Crear nuevo departamento
                await createDepartamento(payload);
                toast.success('Departamento creado exitosamente!');
            }
            onSaveSuccess(); // Llama a la función para refrescar la lista en el padre
            onClose(); // Cierra el modal
        } catch (error) {
            console.error('Error saving departamento:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.name?.[0] || error.response?.data?.detail || 'Error desconocido al guardar el departamento.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={departamentoToEdit ? 'Editar Departamento' : 'Crear Nuevo Departamento'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="departamentoName" className="block text-sm font-medium text-gray-700">Nombre del Departamento</label>
                    <input
                        type="text"
                        id="departamentoName"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="departamentoDescription" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                    <textarea
                        id="departamentoDescription"
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
                        {isLoading ? 'Guardando...' : (departamentoToEdit ? 'Actualizar Departamento' : 'Crear Departamento')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default DepartmentFormModal;