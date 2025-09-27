// itam_frontend/src/pages/masterdata/ProveedorFormModal.js

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { createProveedor, updateProveedor } from '../../api';
import { toast } from 'react-toastify';

const ProveedorFormModal = ({ show, onClose, onSaveSuccess, proveedorToEdit }) => {
    const [formData, setFormData] = useState({
        nombre_empresa: '',
        nit: '',
        direccion: '',
        nombre_contacto: '',
        telefono_ventas: '',
        correo_ventas: '',
        telefono_soporte: '',
        correo_soporte: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (proveedorToEdit) {
            setFormData({
                nombre_empresa: proveedorToEdit.nombre_empresa,
                nit: proveedorToEdit.nit,
                direccion: proveedorToEdit.direccion,
                nombre_contacto: proveedorToEdit.nombre_contacto,
                telefono_ventas: proveedorToEdit.telefono_ventas || '',
                correo_ventas: proveedorToEdit.correo_ventas || '',
                telefono_soporte: proveedorToEdit.telefono_soporte || '',
                correo_soporte: proveedorToEdit.correo_soporte || '',
            });
        } else {
            setFormData({
                nombre_empresa: '',
                nit: '',
                direccion: '',
                nombre_contacto: '',
                telefono_ventas: '',
                correo_ventas: '',
                telefono_soporte: '',
                correo_soporte: '',
            });
        }
    }, [proveedorToEdit]);

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
        if (!formData.nombre_empresa) newErrors.nombre_empresa = 'El nombre de la empresa es obligatorio.';
        if (!formData.nit) newErrors.nit = 'El NIT es obligatorio.';
        if (!formData.direccion) newErrors.direccion = 'La dirección es obligatoria.';
        if (!formData.nombre_contacto) newErrors.nombre_contacto = 'El nombre de contacto es obligatorio.';
        if (formData.correo_ventas && !/\S+@\S+\.\S+/.test(formData.correo_ventas)) {
            newErrors.correo_ventas = 'El correo de ventas no es válido.';
        }
        if (formData.correo_soporte && !/\S+@\S+\.\S+/.test(formData.correo_soporte)) {
            newErrors.correo_soporte = 'El correo de soporte no es válido.';
        }
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
            if (proveedorToEdit) {
                await updateProveedor(proveedorToEdit.id, formData);
                toast.success('Proveedor actualizado exitosamente!');
            } else {
                await createProveedor(formData);
                toast.success('Proveedor creado exitosamente!');
            }
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving proveedor:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.detail || 'Error al guardar el proveedor.';
            toast.error(errorMsg);
            setErrors(error.response?.data || {});
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={proveedorToEdit ? "Editar Proveedor" : "Crear Proveedor"}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[600px] overflow-y-auto">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa *</label>
                    <input
                        type="text"
                        name="nombre_empresa"
                        value={formData.nombre_empresa}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                    {errors.nombre_empresa && <p className="mt-1 text-sm text-red-600">{errors.nombre_empresa}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">NIT *</label>
                    <input
                        type="text"
                        name="nit"
                        value={formData.nit}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                    {errors.nit && <p className="mt-1 text-sm text-red-600">{errors.nit}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección *</label>
                    <textarea
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    ></textarea>
                    {errors.direccion && <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de Contacto *</label>
                    <input
                        type="text"
                        name="nombre_contacto"
                        value={formData.nombre_contacto}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                    />
                    {errors.nombre_contacto && <p className="mt-1 text-sm text-red-600">{errors.nombre_contacto}</p>}
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Contacto de Ventas</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                type="text"
                                name="telefono_ventas"
                                value={formData.telefono_ventas}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo</label>
                            <input
                                type="email"
                                name="correo_ventas"
                                value={formData.correo_ventas}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.correo_ventas && <p className="mt-1 text-sm text-red-600">{errors.correo_ventas}</p>}
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Contacto de Soporte</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                type="text"
                                name="telefono_soporte"
                                value={formData.telefono_soporte}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo</label>
                            <input
                                type="email"
                                name="correo_soporte"
                                value={formData.correo_soporte}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            {errors.correo_soporte && <p className="mt-1 text-sm text-red-600">{errors.correo_soporte}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
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

export default ProveedorFormModal;