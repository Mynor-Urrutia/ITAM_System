// itam_frontend/src/pages/employees/EmployeeDetailModal.js

import React, { useState } from 'react';
import Modal from '../../components/Modal';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const EmployeeDetailModal = ({ show, onClose, employee, onEmployeeUpdate }) => {
    const [showViewer, setShowViewer] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [zoom, setZoom] = useState(1);

    if (!employee) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Fecha inválida';
            }

            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'Fecha inválida';
        }
    };

    const FileViewer = ({ fileUrl, zoom }) => {
        const [numPages, setNumPages] = useState(null);

        const fileName = fileUrl.split('/').pop();
        const ext = fileName.split('.').pop().toLowerCase();

        const onDocumentLoadSuccess = ({ numPages }) => {
            setNumPages(numPages);
        };

        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
            return <img src={fileUrl} alt={fileName} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="max-w-none" />;
        } else if (ext === 'pdf') {
            return (
                <div className="w-full h-full flex flex-col items-center">
                    <div className="max-h-full overflow-y-auto">
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            key={fileUrl}
                            loading={<div className="text-gray-500 p-4">Cargando PDF...</div>}
                            error={<div className="text-red-500 p-4">Error al cargar el PDF</div>}
                        >
                            {numPages && Array.from({ length: numPages }, (_, index) => (
                                <div key={index + 1} className="mb-4 flex justify-center">
                                    <Page
                                        pageNumber={index + 1}
                                        scale={zoom}
                                        className="shadow-lg"
                                        loading={<div className="text-gray-500 p-4">Cargando página {index + 1}...</div>}
                                    />
                                </div>
                            ))}
                        </Document>
                    </div>
                    {numPages && numPages > 1 && (
                        <div className="mt-4 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded">
                            PDF con {numPages} página{numPages > 1 ? 's' : ''} - Desplázate para ver todas las páginas
                        </div>
                    )}
                </div>
            );
        } else {
            return <div className="text-gray-500 p-4">No se puede visualizar este tipo de archivo.</div>;
        }
    };

    return (
        <>
            <Modal show={show} onClose={onClose} title={`Detalles del Empleado: ${employee.employee_number}`} size="xl">
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-900">
                                {employee.first_name} {employee.last_name}
                            </h2>
                            <p className="text-blue-700">No. Empleado: {employee.employee_number}</p>
                        </div>
                    </div>
                </div>

                {/* Información Personal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">👤 Información Personal</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">No. Empleado:</span>
                                <span className="text-sm text-gray-900">{employee.employee_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Nombres:</span>
                                <span className="text-sm text-gray-900">{employee.first_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Apellidos:</span>
                                <span className="text-sm text-gray-900">{employee.last_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Inicio de Labores:</span>
                                <span className="text-sm text-gray-900">{formatDate(employee.start_date)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información Organizacional */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">🏢 Información Organizacional</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Departamento:</span>
                                <span className="text-sm text-gray-900">{employee.department_name || 'No asignado'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Área:</span>
                                <span className="text-sm text-gray-900">{employee.area_name || 'No asignado'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Región:</span>
                                <span className="text-sm text-gray-900">{employee.region_name || 'No asignado'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Finca:</span>
                                <span className="text-sm text-gray-900">{employee.finca_name || 'No asignado'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Jefe Inmediato:</span>
                                <span className="text-sm text-gray-900">{employee.supervisor_name || 'No asignado'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Documento */}
                    {employee.document && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">📄 Documento</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Archivo PDF:</span>
                                    <p className="text-sm text-gray-900 break-all">{employee.document.split('/').pop()}</p>
                                </div>
                                <a
                                    href={employee.document}
                                    download
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-3 font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                                >
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Descargar
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Información del Sistema */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Sistema</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Fecha de Creación:</span>
                                <span className="text-sm text-gray-900">{formatDate(employee.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">Última Actualización:</span>
                                <span className="text-sm text-gray-900">{formatDate(employee.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end pt-4 border-t bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    >
                        Cerrar
                    </button>
                </div>
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

export default EmployeeDetailModal;