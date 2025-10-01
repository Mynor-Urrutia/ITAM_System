// itam_frontend/src/pages/assets/MaintenanceModal.js

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { createMaintenance, getUsers, getActivos } from '../../api';
import { toast } from 'react-toastify';

const MaintenanceModal = ({ show, onClose, activo, onMaintenanceSuccess }) => {
    const [formData, setFormData] = useState({
        asset_identifier: '',
        maintenance_date: '',
        technician: '',
        findings: '',
        attachments: []
    });
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isValidAsset, setIsValidAsset] = useState(activo ? true : false);
    const [assetValidationMessage, setAssetValidationMessage] = useState('');

    useEffect(() => {
        if (show) {
            loadTechnicians();
            // Set default date to today and asset identifier
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({
                ...prev,
                maintenance_date: today,
                asset_identifier: activo ? activo.hostname : ''
            }));
            setIsValidAsset(activo ? true : false);
            setAssetValidationMessage('');
        }
    }, [show, activo]);

    const loadTechnicians = async () => {
        try {
            const response = await getUsers();
            setTechnicians(response.data.results || []);
        } catch (error) {
            console.error('Error loading technicians:', error);
        }
    };

    const validateAsset = async (identifier) => {
        if (!identifier.trim()) {
            setIsValidAsset(false);
            setAssetValidationMessage('');
            return;
        }
        try {
            const response = await getActivos({ search: identifier.trim(), page_size: 1 });
            const exists = response.data.results && response.data.results.length > 0;
            setIsValidAsset(exists);
            setAssetValidationMessage(exists ? '' : 'El activo no existe o no está registrado.');
        } catch (error) {
            console.error('Error validating asset:', error);
            setIsValidAsset(false);
            setAssetValidationMessage('Error al validar el activo.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'asset_identifier' && !activo) {
            validateAsset(value);
        }
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, attachments: Array.from(e.target.files) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.asset_identifier.trim() || !formData.maintenance_date || !formData.technician || !formData.findings.trim()) {
            setErrors({
                asset_identifier: !formData.asset_identifier.trim() ? 'El identificador del activo es obligatorio' : '',
                maintenance_date: !formData.maintenance_date ? 'La fecha es obligatoria' : '',
                technician: !formData.technician ? 'El técnico es obligatorio' : '',
                findings: !formData.findings.trim() ? 'Los hallazgos son obligatorios' : ''
            });
            return;
        }

        if (!activo && !isValidAsset) {
            setErrors({
                asset_identifier: assetValidationMessage
            });
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('asset_identifier', formData.asset_identifier.trim());
            data.append('maintenance_date', formData.maintenance_date);
            data.append('technician', formData.technician);
            data.append('findings', formData.findings.trim());

            formData.attachments.forEach((file, index) => {
                data.append('attachments', file);
            });

            await createMaintenance(data);
            toast.success('Mantenimiento registrado exitosamente.');
            onMaintenanceSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error creating maintenance:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.error || 'Error al registrar el mantenimiento.';
            toast.error(errorMessage);
            setErrors(error.response?.data || {});
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            asset_identifier: activo ? activo.hostname : '',
            maintenance_date: '',
            technician: '',
            findings: '',
            attachments: []
        });
        setErrors({});
        setIsValidAsset(activo ? true : false);
        setAssetValidationMessage('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} title={activo ? `Registrar Mantenimiento - ${activo.hostname}` : 'Registrar Mantenimiento Manual'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Registro de Mantenimiento
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>Complete la información del mantenimiento físico realizado al activo.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {!activo && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Identificador del Activo (Hostname o Serie) *
                        </label>
                        <input
                            type="text"
                            name="asset_identifier"
                            value={formData.asset_identifier}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            placeholder="Ingrese hostname o número de serie"
                            required
                        />
                        {errors.asset_identifier && <p className="mt-1 text-sm text-red-600">{errors.asset_identifier}</p>}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Mantenimiento *
                        </label>
                        <input
                            type="date"
                            name="maintenance_date"
                            value={formData.maintenance_date}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            required
                        />
                        {errors.maintenance_date && <p className="mt-1 text-sm text-red-600">{errors.maintenance_date}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Técnico *
                        </label>
                        <select
                            name="technician"
                            value={formData.technician}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                            required
                        >
                            <option value="">Seleccionar técnico...</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>
                                    {tech.first_name} {tech.last_name} ({tech.username})
                                </option>
                            ))}
                        </select>
                        {errors.technician && <p className="mt-1 text-sm text-red-600">{errors.technician}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hallazgos *
                    </label>
                    <textarea
                        name="findings"
                        value={formData.findings}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        rows={4}
                        placeholder="Describa los hallazgos encontrados durante el mantenimiento..."
                        required
                    />
                    {errors.findings && <p className="mt-1 text-sm text-red-600">{errors.findings}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Archivos Adjuntos (Opcional)
                    </label>
                    <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Selecciona imágenes (JPG, PNG, GIF), PDF o documentos Word. Puedes seleccionar múltiples archivos.
                    </p>
                    {formData.attachments.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-700">Archivos seleccionados: {formData.attachments.length}</p>
                            <ul className="text-sm text-gray-600">
                                {formData.attachments.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrar Mantenimiento'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default MaintenanceModal;