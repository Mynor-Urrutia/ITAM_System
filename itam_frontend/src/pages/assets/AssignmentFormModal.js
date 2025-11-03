/**
 * Modal de Asignación Masiva de Activos.
 *
 * Interfaz para asignar múltiples activos a un empleado simultáneamente,
 * permitiendo editar especificaciones técnicas de cada activo durante
 * el proceso de asignación.
 *
 * Características principales:
 * - Asignación masiva con validación de reglas de negocio
 * - Navegación entre activos con vista previa
 * - Edición de especificaciones técnicas por categoría de activo
 * - Formularios dinámicos basados en tipo de activo (computo/red/periferico)
 * - Estados de carga y manejo de errores
 * - Confirmación de asignación antes de envío
 */

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { bulkAssignAssets } from '../../api';
import { toast } from 'react-toastify';

const AssignmentFormModal = ({ show, onClose, selectedEmployee, selectedAssets, onAssignmentSuccess }) => {
    const [assetUpdates, setAssetUpdates] = useState({});
    const [loading, setLoading] = useState(false);
    const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

    useEffect(() => {
        if (show && selectedAssets.length > 0) {
            // Initialize asset updates with current values
            const initialUpdates = {};
            selectedAssets.forEach(asset => {
                initialUpdates[asset.id] = {
                    ram: asset.ram || '',
                    almacenamiento: asset.almacenamiento || '',
                    procesador: asset.procesador || '',
                    tarjeta_grafica: asset.tarjeta_grafica || '',
                    wifi: asset.wifi || false,
                    ethernet: asset.ethernet || false,
                    puertos_ethernet: asset.puertos_ethernet || '',
                    puertos_sfp: asset.puertos_sfp || '',
                    puerto_consola: asset.puerto_consola || false,
                    puertos_poe: asset.puertos_poe || '',
                    alimentacion: asset.alimentacion || '',
                    administrable: asset.administrable || false,
                    tamano: asset.tamano || '',
                    color: asset.color || '',
                    conectores: asset.conectores || '',
                    cables: asset.cables || ''
                };
            });
            setAssetUpdates(initialUpdates);
            setCurrentAssetIndex(0);
        }
    }, [show, selectedAssets]);

    const handleAssetUpdate = (assetId, field, value) => {
        setAssetUpdates(prev => ({
            ...prev,
            [assetId]: {
                ...prev[assetId],
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const assignmentData = {
                employee_id: selectedEmployee.id,
                activo_ids: selectedAssets.map(asset => asset.id),
                asset_updates: assetUpdates
            };

            await bulkAssignAssets(assignmentData);
            toast.success('Activos asignados correctamente.');
            onAssignmentSuccess();
            onClose();
        } catch (error) {
            console.error('Error assigning assets:', error);
            const errorMessage = error.response?.data?.error || 'Error al asignar los activos.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getAssetTypeCategory = (asset) => {
        // Use tipo_activo_name from the asset data to determine category
        const tipoName = asset.tipo_activo_name?.toLowerCase() || '';

        // This should match the backend logic in ModeloActivo.get_asset_type_category()
        const computoTypes = ['computadora', 'laptop', 'desktop', 'servidor', 'all in one'];
        if (computoTypes.some(type => tipoName.includes(type))) return 'computo';

        const redTypes = ['switch', 'router', 'routers', 'firewall', 'ap wifi', 'p2p'];
        if (redTypes.some(type => tipoName.includes(type))) return 'red';

        return 'periferico';
    };

    const renderAssetSpecsForm = (asset) => {
        const category = getAssetTypeCategory(asset);
        const updates = assetUpdates[asset.id] || {};

        if (category === 'computo') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Procesador</label>
                        <input
                            type="text"
                            value={updates.procesador || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'procesador', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RAM (GB)</label>
                        <input
                            type="number"
                            value={updates.ram || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'ram', parseInt(e.target.value) || '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Almacenamiento</label>
                        <input
                            type="text"
                            value={updates.almacenamiento || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'almacenamiento', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tarjeta Gráfica</label>
                        <input
                            type="text"
                            value={updates.tarjeta_grafica || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'tarjeta_grafica', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={updates.wifi || false}
                            onChange={(e) => handleAssetUpdate(asset.id, 'wifi', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">WIFI</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={updates.ethernet || false}
                            onChange={(e) => handleAssetUpdate(asset.id, 'ethernet', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Ethernet</label>
                    </div>
                </div>
            );
        } else if (category === 'red') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Puertos Ethernet</label>
                        <input
                            type="text"
                            value={updates.puertos_ethernet || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'puertos_ethernet', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Puertos SFP</label>
                        <input
                            type="text"
                            value={updates.puertos_sfp || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'puertos_sfp', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={updates.puerto_consola || false}
                            onChange={(e) => handleAssetUpdate(asset.id, 'puerto_consola', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Puerto Consola</label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Puertos PoE</label>
                        <input
                            type="text"
                            value={updates.puertos_poe || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'puertos_poe', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alimentación</label>
                        <input
                            type="text"
                            value={updates.alimentacion || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'alimentacion', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={updates.administrable || false}
                            onChange={(e) => handleAssetUpdate(asset.id, 'administrable', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Administrable</label>
                    </div>
                </div>
            );
        } else {
            // Periferico
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
                        <input
                            type="text"
                            value={updates.tamano || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'tamano', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <input
                            type="text"
                            value={updates.color || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conectores</label>
                        <textarea
                            value={updates.conectores || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'conectores', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cables</label>
                        <textarea
                            value={updates.cables || ''}
                            onChange={(e) => handleAssetUpdate(asset.id, 'cables', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            );
        }
    };

    if (!selectedAssets || selectedAssets.length === 0) return null;

    const currentAsset = selectedAssets[currentAssetIndex];

    return (
        <Modal show={show} onClose={onClose} title="Revisar y Editar Activos para Asignación" size="xl">
            <div className="space-y-6">
                {/* Employee Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Empleado</h3>
                    <p className="text-blue-700">
                        {selectedEmployee.first_name} {selectedEmployee.last_name} ({selectedEmployee.employee_number})
                    </p>
                </div>

                {/* Asset Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <h3 className="text-lg font-medium text-gray-900">
                        Activo {currentAssetIndex + 1} de {selectedAssets.length}
                    </h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentAssetIndex(Math.max(0, currentAssetIndex - 1))}
                            disabled={currentAssetIndex === 0}
                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentAssetIndex(Math.min(selectedAssets.length - 1, currentAssetIndex + 1))}
                            disabled={currentAssetIndex === selectedAssets.length - 1}
                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>

                {/* Current Asset Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <span className="font-medium">Hostname:</span> {currentAsset.hostname}
                        </div>
                        <div>
                            <span className="font-medium">Serie:</span> {currentAsset.serie}
                        </div>
                        <div>
                            <span className="font-medium">Tipo:</span> {currentAsset.tipo_activo_name}
                        </div>
                        <div>
                            <span className="font-medium">Marca/Modelo:</span> {currentAsset.marca_name} / {currentAsset.modelo_name}
                        </div>
                    </div>

                    {/* Editable Specs */}
                    <div>
                        <h4 className="font-medium text-gray-800 mb-3">Especificaciones (editables)</h4>
                        {renderAssetSpecsForm(currentAsset)}
                    </div>
                </div>

                {/* Asset Thumbnails */}
                <div className="flex space-x-2 overflow-x-auto">
                    {selectedAssets.map((asset, index) => (
                        <button
                            key={asset.id}
                            onClick={() => setCurrentAssetIndex(index)}
                            className={`flex-shrink-0 p-2 rounded border-2 text-xs ${
                                index === currentAssetIndex
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                        >
                            <div className="font-medium">{asset.hostname}</div>
                            <div className="text-gray-600">{asset.serie}</div>
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        disabled={loading}
                    >
                        {loading ? 'Asignando...' : `Asignar ${selectedAssets.length} Activo${selectedAssets.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignmentFormModal;