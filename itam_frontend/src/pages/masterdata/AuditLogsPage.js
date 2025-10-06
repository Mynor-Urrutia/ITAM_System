// C:\Proyectos\ITAM_System\itam_frontend\src\pages\masterdata\AuditLogsPage.js
import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../api'; // Importa las funciones API
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // Para permisos
import Pagination from '../../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

function AuditLogsPage() {
    const [auditLogs, setAuditLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [expandedCards, setExpandedCards] = useState(new Set());
    const { hasPermission } = useAuth();

    const canViewAuditLogs = true; // hasPermission('masterdata.view_auditlog'); // Temporarily true for testing
    const pageSizeOptions = [5, 10, 25, 50, 100, 200];

    useEffect(() => {
        if (canViewAuditLogs) {
            fetchAuditLogs();
        }
    }, [canViewAuditLogs, currentPage, pageSize]);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize
            };
            const response = await getAuditLogs(params);
            setAuditLogs(response.data.results || response.data);
            setTotalPages(Math.ceil((response.data.count || response.data.length) / pageSize));
            setTotalCount(response.data.count || response.data.length);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            toast.error('Error al cargar los registros de auditoría.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('es-GT', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const toggleCardExpansion = (logId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(logId)) {
            newExpanded.delete(logId);
        } else {
            newExpanded.add(logId);
        }
        setExpandedCards(newExpanded);
    };

    const renderDataChanges = (data, activityType) => {
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
            return 'N/A';
        }

        // For UPDATE operations, data is in format {field: {old: value, new: value}}
        if (activityType === 'UPDATE' && typeof data === 'object') {
            const changes = Object.entries(data).map(([field, change]) => {
                if (change && typeof change === 'object' && 'old' in change && 'new' in change) {
                    return (
                        <div key={field} className="mb-2 p-2 bg-gray-50 rounded">
                            <div className="font-medium text-gray-700 capitalize">{field.replace(/_/g, ' ')}:</div>
                            <div className="text-gray-700 text-sm">Antes: {String(change.old || 'N/A')}</div>
                            <div className="text-gray-700 text-sm">Después: {String(change.new || 'N/A')}</div>
                        </div>
                    );
                }
                return null;
            }).filter(Boolean);

            if (changes.length > 0) {
                return <div className="max-w-xs">{changes}</div>;
            }
        }

        // For CREATE operations, show all filled fields in rows
        if (activityType === 'CREATE' && typeof data === 'object') {
            const filledFields = Object.entries(data).filter(([key, value]) => {
                // Show fields that have meaningful values (not null, undefined, or empty string)
                // Exclude 'id' field for CREATE operations
                return key !== 'id' && value !== null && value !== undefined && value !== '';
            });

            if (filledFields.length > 0) {
                const fieldsDisplay = filledFields.map(([field, value]) => (
                    <div key={field} className="mb-2 p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-700 capitalize">{field.replace(/_/g, ' ')}:</div>
                        <div className="text-gray-700 text-sm">{String(value)}</div>
                    </div>
                ));

                return <div className="max-w-xs">{fieldsDisplay}</div>;
            }
        }

        // For DELETE operations, show full data
        if (activityType === 'DELETE' && typeof data === 'object') {
            const filledFields = Object.entries(data).filter(([key, value]) => {
                // Show fields that have meaningful values (not null, undefined, or empty string)
                return value !== null && value !== undefined && value !== '';
            });

            if (filledFields.length > 0) {
                const fieldsDisplay = filledFields.map(([field, value]) => (
                    <div key={field} className="mb-2 p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-700 capitalize">{field.replace(/_/g, ' ')}:</div>
                        <div className="text-gray-700 text-sm">{String(value)}</div>
                    </div>
                ));

                return <div className="max-w-xs">{fieldsDisplay}</div>;
            }
        }

        // For RETIRE operations, show the data fields
        if (activityType === 'RETIRE' && typeof data === 'object') {
            const filledFields = Object.entries(data).filter(([key, value]) => {
                // Show fields that have meaningful values (not null, undefined, or empty string)
                return value !== null && value !== undefined && value !== '';
            });

            if (filledFields.length > 0) {
                const fieldsDisplay = filledFields.map(([field, value]) => (
                    <div key={field} className="mb-2 p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-700 capitalize">{field.replace(/_/g, ' ')}:</div>
                        <div className="text-gray-700 text-sm">{String(value)}</div>
                    </div>
                ));

                return <div className="max-w-xs">{fieldsDisplay}</div>;
            }
        }

        // For REACTIVATE operations, show the data fields
        if (activityType === 'REACTIVATE' && typeof data === 'object') {
            const filledFields = Object.entries(data).filter(([key, value]) => {
                // Show fields that have meaningful values (not null, undefined, or empty string)
                return value !== null && value !== undefined && value !== '';
            });

            if (filledFields.length > 0) {
                const fieldsDisplay = filledFields.map(([field, value]) => (
                    <div key={field} className="mb-2 p-2 bg-gray-50 rounded">
                        <div className="font-medium text-gray-700 capitalize">{field.replace(/_/g, ' ')}:</div>
                        <div className="text-gray-700 text-sm">{String(value)}</div>
                    </div>
                ));

                return <div className="max-w-xs">{fieldsDisplay}</div>;
            }
        }

        // Fallback for other cases
        return (
            <div className="max-w-xs truncate text-xs font-mono bg-gray-50 p-2 rounded">
                {JSON.stringify(data, null, 2)}
            </div>
        );
    };


    return (
        <div className="p-2 sm:p-4 relative min-h-screen">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
                {/* Title */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Registros de Auditoría</h1>
                </div>

                {/* Search Box for Mobile */}
                <div className="mb-4">
                    <div className="relative">
                        <label htmlFor="search" className="sr-only">Buscar Registros</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Buscar registros..."
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Registros de Auditoría</h1>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
                {auditLogs.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No hay registros de auditoría disponibles.</p>
                ) : (
                    auditLogs.map((log) => {
                        const isExpanded = expandedCards.has(log.id);
                        return (
                            <div key={log.id} className="bg-white rounded-lg shadow border">
                                {/* Header - Always visible */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-sm text-gray-900">{log.description}</h3>
                                            <p className="text-xs text-gray-600 mt-1">
                                                <span className="font-medium">Fecha:</span> {formatDateTime(log.timestamp)}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                <span className="font-medium">Usuario:</span> {log.user_username || 'Sistema'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                log.activity_type === 'CREATE' ? 'bg-green-100 text-green-800' :
                                                log.activity_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                                log.activity_type === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {log.activity_type}
                                            </span>
                                            <button
                                                onClick={() => toggleCardExpansion(log.id)}
                                                className="text-gray-500 hover:text-gray-700 p-1"
                                                title={isExpanded ? "Contraer" : "Expandir"}
                                            >
                                                <FontAwesomeIcon
                                                    icon={isExpanded ? faChevronUp : faChevronDown}
                                                    className="text-sm"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Content */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-200">
                                        <div className="space-y-2 mt-3">
                                            <p className="text-xs text-gray-600">
                                                <span className="font-medium">Modelo:</span> {log.record_model || 'N/A'}
                                            </p>
                                            <div className="text-xs text-gray-600">
                                                <span className="font-medium">Cambios:</span>
                                                <div className="mt-1 max-h-32 overflow-y-auto">
                                                    {renderDataChanges(log.new_data, log.activity_type)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white shadow overflow-hidden rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha y Hora
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo de Actividad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Modelo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descripción
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cambios Realizados
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {auditLogs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No hay registros de auditoría disponibles.
                                </td>
                            </tr>
                        ) : (
                            auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDateTime(log.timestamp)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            log.activity_type === 'CREATE' ? 'bg-green-100 text-green-800' :
                                            log.activity_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                            log.activity_type === 'DELETE' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {log.activity_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {log.user_username || 'Sistema'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {log.record_model || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {log.description}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {renderDataChanges(log.new_data, log.activity_type)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Component */}
            {totalCount > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    pageSizeOptions={pageSizeOptions}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    );
}

export default AuditLogsPage;