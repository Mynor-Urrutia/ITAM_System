/**
 * Modal de Formulario para Marcas.
 *
 * Formulario simple para crear y editar marcas de equipos tecnológicos.
 * Incluye validación básica y manejo de estados de carga.
 *
 * Características principales:
 * - Creación y edición de marcas
 * - Validación de nombre obligatorio
 * - Descripción opcional
 * - Estados de carga y manejo de errores
 * - Diseño responsive y accesible
 */

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { createMarca, updateMarca } from '../../api';
import { toast } from 'react-toastify';

const MarcaFormModal = ({ show, onClose, onSaveSuccess, marcaToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (marcaToEdit) {
            setFormData({
                name: marcaToEdit.name,
                description: marcaToEdit.description || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
            });
        }
    }, [marcaToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar errores al cambiar el input
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'El nombre es obligatorio.';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const findErrors = validate();
        if (Object.keys(findErrors).length > 0) {
            setErrors(findErrors);
            return;
        }

        setLoading(true);
        try {
            if (marcaToEdit) {
                await updateMarca(marcaToEdit.id, formData);
                toast.success('Marca actualizada exitosamente!');
            } else {
                await createMarca(formData);
                toast.success('Marca creada exitosamente!');
            }
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving marca:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.detail || 'Error al guardar la marca.';
            toast.error(errorMsg);
            setErrors(error.response?.data || {});
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={marcaToEdit ? "Editar Marca" : "Crear Marca"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default MarcaFormModal;