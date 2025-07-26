// C:\Proyectos\ITAM_System\itam_frontend\src\pages\masterdata\AreaFormModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createArea, updateArea, getDepartamentos } from '../../api'; // Importa las funciones API
import Modal from '../../components/Modal'; // Importa tu Modal personalizado

const AreaFormModal = ({ show, onClose, onSaveSuccess, areaToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [departamentoId, setDepartamentoId] = useState(''); // ID del departamento seleccionado
    const [departamentos, setDepartamentos] = useState([]); // Lista de departamentos para el select
    const [isLoading, setIsLoading] = useState(false);
    const [loadingDepartamentos, setLoadingDepartamentos] = useState(true);

    useEffect(() => {
        const fetchDepartamentosList = async () => {
            try {
                const response = await getDepartamentos();
                setDepartamentos(response.data);
                setLoadingDepartamentos(false);
            } catch (error) {
                console.error('Error fetching departments for form:', error);
                toast.error('Error al cargar la lista de departamentos.');
                setLoadingDepartamentos(false);
            }
        };
        fetchDepartamentosList();
    }, []);

    useEffect(() => {
        if (areaToEdit) {
            setName(areaToEdit.name);
            setDescription(areaToEdit.description || '');
            setDepartamentoId(areaToEdit.departamento || ''); // Asigna el ID del departamento
        } else {
            setName('');
            setDescription('');
            // Establece el primer departamento como valor por defecto si hay alguno
            setDepartamentoId(departamentos.length > 0 ? departamentos[0].id : '');
        }
    }, [areaToEdit, show, departamentos]); // Dependencia de `departamentos` para que se establezca el valor por defecto

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('El nombre del área no puede estar vacío.');
            return;
        }
        if (!departamentoId) {
            toast.error('Por favor, selecciona un departamento.');
            return;
        }

        setIsLoading(true);
        try {
            const payload = { name, description, departamento: departamentoId };
            if (areaToEdit) {
                // Actualizar área existente
                await updateArea(areaToEdit.id, payload);
                toast.success('Área actualizada exitosamente!');
            } else {
                // Crear nueva área
                await createArea(payload);
                toast.success('Área creada exitosamente!');
            }
            onSaveSuccess(); // Llama a la función para refrescar la lista en el padre
            onClose(); // Cierra el modal
        } catch (error) {
            console.error('Error saving area:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.name?.[0] || error.response?.data?.departamento?.[0] || error.response?.data?.non_field_errors?.[0] || error.response?.data?.detail || 'Error desconocido al guardar el área.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={areaToEdit ? 'Editar Área' : 'Crear Nueva Área'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="areaName" className="block text-sm font-medium text-gray-700">Nombre del Área</label>
                    <input
                        type="text"
                        id="areaName"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="areaDescription" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                    <textarea
                        id="areaDescription"
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isLoading}
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">Departamento</label>
                    {loadingDepartamentos ? (
                        <p className="mt-1 text-gray-600">Cargando departamentos...</p>
                    ) : (
                        <select
                            id="departamento"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            value={departamentoId}
                            onChange={(e) => setDepartamentoId(e.target.value)}
                            required
                            disabled={isLoading}
                        >
                            <option value="">-- Selecciona un Departamento --</option>
                            {departamentos.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    )}
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
                        {isLoading ? 'Guardando...' : (areaToEdit ? 'Actualizar Área' : 'Crear Área')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AreaFormModal;