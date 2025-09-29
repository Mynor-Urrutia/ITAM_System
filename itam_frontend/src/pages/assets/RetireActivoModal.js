// itam_frontend/src/pages/assets/RetireActivoModal.js

import React, { useState } from 'react';
import Modal from '../../components/Modal';
import { retireActivo } from '../../api';
import { toast } from 'react-toastify';

const RetireActivoModal = ({ show, onClose, activo, onRetireSuccess }) => {
    const [motivo, setMotivo] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!motivo.trim()) {
            setErrors({ motivo: 'El motivo de baja es obligatorio' });
            return;
        }

        setLoading(true);
        try {
            await retireActivo(activo.id, { motivo_baja: motivo.trim() });
            toast.success('Activo dado de baja exitosamente.');
            onRetireSuccess();
            onClose();
        } catch (error) {
            console.error('Error retiring activo:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.error || 'Error al dar de baja el activo.';
            toast.error(errorMessage);
            setErrors(error.response?.data || {});
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setMotivo('');
        setErrors({});
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} title="Dar de Baja Activo" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Confirmación de Baja
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>¿Está seguro de que desea dar de baja el activo <strong>{activo?.hostname}</strong>?</p>
                                <p className="mt-1">Esta acción no se puede deshacer.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motivo de Baja *
                    </label>
                    <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        rows={4}
                        placeholder="Describa el motivo por el cual se está dando de baja este activo..."
                        required
                    />
                    {errors.motivo && <p className="mt-1 text-sm text-red-600">{errors.motivo}</p>}
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Información de la Baja</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Usuario:</strong> Se registrará automáticamente</p>
                        <p><strong>Fecha:</strong> Se registrará automáticamente</p>
                    </div>
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
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : 'Confirmar Baja'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default RetireActivoModal;