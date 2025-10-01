// itam_frontend/src/pages/assets/MaintenanceDetailModal.js

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { getMaintenance, getMaintenances } from '../../api';
import { toast } from 'react-toastify';

const MaintenanceDetailModal = ({ show, onClose, maintenanceId }) => {
    const [maintenance, setMaintenance] = useState(null);
    const [maintenanceHistory, setMaintenanceHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && maintenanceId) {
            fetchMaintenanceDetails();
        }
    }, [show, maintenanceId]);

    const fetchMaintenanceDetails = async () => {
        try {
            setLoading(true);
            const response = await getMaintenance(maintenanceId);
            const maintenanceData = response.data;
            setMaintenance(maintenanceData);

            // Fetch maintenance history for the asset
            if (maintenanceData.activo_id) {
                const historyResponse = await getMaintenances({
                    asset: maintenanceData.activo_id,
                    ordering: '-maintenance_date',
                    page_size: 100
                });
                setMaintenanceHistory(historyResponse.data.results || []);
            }
        } catch (error) {
            console.error('Error fetching maintenance details:', error);
            toast.error('Error al cargar los detalles del mantenimiento.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        // If it's a datetime string (contains 'T'), use as is; else append time to avoid timezone shift
        const dateStr = dateString.includes('T') ? dateString : dateString + 'T12:00:00';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!maintenance) return null;

    return (
        <Modal show={show} onClose={onClose} title="Detalles del Mantenimiento" size="2xl">
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Cargando detalles...</div>
                    </div>
                ) : (
                    <>
                        {/* Información Principal */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Información del Mantenimiento</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Activo:</span>
                                    <p className="text-base font-semibold text-gray-900">{maintenance.activo_hostname}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Fecha de Mantenimiento:</span>
                                    <p className="text-base font-semibold text-gray-900">{formatDate(maintenance.maintenance_date)}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Técnico:</span>
                                    <p className="text-base font-semibold text-gray-900">{maintenance.technician_name}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Próximo Mantenimiento:</span>
                                    <p className="text-base font-semibold text-gray-900">{formatDate(maintenance.next_maintenance_date)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Hallazgos */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">🔍 Hallazgos</h3>
                            <div className="bg-gray-50 p-4 rounded border">
                                <p className="text-gray-900 whitespace-pre-wrap">{maintenance.findings || 'No hay hallazgos registrados'}</p>
                            </div>
                        </div>

                        {/* Archivos Adjuntos */}
                        {maintenance.attachments && maintenance.attachments.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">📎 Archivos Adjuntos</h3>
                                <div className="space-y-2">
                                    {maintenance.attachments.map((filePath, index) => {
                                        const fileName = filePath.split('/').pop();
                                        const fileUrl = `http://127.0.0.1:8000/media/${filePath}`;
                                        return (
                                            <a
                                                key={index}
                                                href={fileUrl}
                                                download={fileName}
                                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                                {fileName}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Historial de Mantenimientos */}
                        {maintenanceHistory.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Historial de Mantenimientos</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hallazgos</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adjuntos</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {maintenanceHistory.map((item) => (
                                                <tr key={item.id} className={item.id === maintenanceId ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(item.maintenance_date)}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        {item.technician_name}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                                                        {item.findings || 'Sin hallazgos'}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                        {item.attachments ? item.attachments.length : 0}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Información del Sistema */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Información del Sistema</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Fecha de Creación:</span>
                                    <p className="text-base font-semibold text-gray-900">{formatDate(maintenance.created_at)}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Última Actualización:</span>
                                    <p className="text-base font-semibold text-gray-900">{formatDate(maintenance.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default MaintenanceDetailModal;