/**
 * Modal de Detalles de Mantenimiento.
 *
 * Vista completa de un registro de mantenimiento específico con
 * historial completo del activo, visor de documentos adjuntos
 * y navegación entre mantenimientos relacionados.
 *
 * Características principales:
 * - Vista detallada de mantenimiento individual
 * - Historial completo de mantenimientos del activo
 * - Visor integrado de documentos (PDF, imágenes)
 * - Navegación entre registros de mantenimiento
 * - Información técnica completa del activo
 * - Estados de carga y manejo de errores
 * - Diseño responsive con secciones organizadas
 */

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { getMaintenance, getMaintenances } from '../../api';
import { toast } from 'react-toastify';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const MaintenanceDetailModal = ({ show, onClose, maintenanceId }) => {
    const [maintenance, setMaintenance] = useState(null);
    const [maintenanceHistory, setMaintenanceHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [zoom, setZoom] = useState(1);

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
                    activo: maintenanceData.activo_id,
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

    const isViewable = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext);
    };

    const FileViewer = ({ fileUrl, zoom }) => {
        const fileName = fileUrl.split('/').pop();
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
            return <img src={fileUrl} alt={fileName} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="max-w-none" />;
        } else if (ext === 'pdf') {
            return (
                <div className="w-full h-full flex justify-center items-center">
                    <Document file={fileUrl}>
                        <Page pageNumber={1} scale={zoom} className="shadow-lg" />
                    </Document>
                </div>
            );
        } else {
            return <div>No se puede visualizar este tipo de archivo.</div>;
        }
    };

    if (!maintenance) return null;

    return (
        <>
            <Modal show={show} onClose={onClose} title="Detalles del Mantenimiento" size="2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-8">
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
                                        <span className="text-sm font-medium text-gray-600">Número de Serie:</span>
                                        <p className="text-base font-semibold text-gray-900">{maintenance.activo_serie}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Fecha de Mantenimiento:</span>
                                        <p className="text-base font-semibold text-gray-900">{formatDate(maintenance.maintenance_date)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Próximo Mantenimiento:</span>
                                        <p className="text-base font-semibold text-gray-900">{formatDate(maintenance.next_maintenance_date)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Técnico:</span>
                                        <p className="text-base font-semibold text-gray-900">{maintenance.technician_name}</p>
                                    </div>
                                </div>
                            </div>

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
                                             const baseHost = window.location.origin; // <-- NUEVA LÍNEA
                                             const fileUrl = `${baseHost}/media/${filePath}`; // <-- LÍNEA MODIFICADA
                                             const viewable = isViewable(fileName);
                                             const ext = fileName.split('.').pop().toLowerCase();
                                             return (
                                                 <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                     <span className="text-sm text-gray-700">{fileName}</span>
                                                     <div className="flex space-x-2">
                                                         {viewable && (
                                                             <button
                                                                 onClick={() => {
                                                                     if (ext === 'pdf') {
                                                                         window.open(fileUrl, '_blank');
                                                                     } else {
                                                                         setCurrentFile(fileUrl);
                                                                         setZoom(1);
                                                                         setShowViewer(true);
                                                                     }
                                                                 }}
                                                                 className="inline-flex items-center text-sm text-green-600 hover:text-green-800 hover:underline"
                                                             >
                                                                 <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                     <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                     <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                                 </svg>
                                                                 Ver
                                                             </button>
                                                         )}
                                                         <a
                                                             href={fileUrl}
                                                             download={fileName}
                                                             className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                         >
                                                             <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                 <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                             </svg>
                                                             Descargar
                                                         </a>
                                                     </div>
                                                 </div>
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
                                                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Mantenimiento</th>
                                                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hostname</th>
                                                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Serial</th>
                                                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                                                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Archivos</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="bg-white divide-y divide-gray-200">
                                                 {maintenanceHistory.map((item) => (
                                                     <tr key={item.id} className={item.id === maintenanceId ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                                         <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                             {formatDate(item.maintenance_date)}
                                                         </td>
                                                         <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                             {item.activo_hostname}
                                                         </td>
                                                         <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                             {item.activo_serie}
                                                         </td>
                                                         <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                             {item.technician_name}
                                                         </td>
                                                         <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                             {item.attachments && item.attachments.length > 0 ? (
                                                                 (() => {
                                                                     const firstFile = item.attachments[0];
                                                                     const fileName = firstFile.split('/').pop();
                                                                     const viewable = isViewable(fileName);
                                                                     return viewable ? (
                                                                         <button
                                                                             onClick={() => {
                                                                                 const fileUrl = `/media/${firstFile}`;
                                                                                 setCurrentFile(fileUrl);
                                                                                 setZoom(1);
                                                                                 setShowViewer(true);
                                                                             }}
                                                                             className="inline-flex items-center text-sm text-green-600 hover:text-green-800 hover:underline"
                                                                         >
                                                                             Ver
                                                                         </button>
                                                                     ) : 'Descargar';
                                                                 })()
                                                             ) : 'No hay archivos'}
                                                         </td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                     </div>
                                 </div>
                             )}
                         </>
                    )}
                </div>
            </Modal>

            {/* File Viewer Modal */}
            <Modal show={showViewer} onClose={() => setShowViewer(false)} title="Vista del Archivo" size="xl">
                <div className="mb-4 flex justify-center space-x-2">
                    <button
                        onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                        Zoom Out -
                    </button>
                    <span className="px-3 py-1 text-sm">{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                        Zoom In +
                    </button>
                </div>
                <div className="flex justify-center items-center">
                    {currentFile && <FileViewer fileUrl={currentFile} zoom={zoom} />}
                </div>
            </Modal>
        </>
    );
};

export default MaintenanceDetailModal;