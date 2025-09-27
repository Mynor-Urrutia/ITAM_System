// C:\Proyectos\ITAM_System\itam_frontend\src\pages\masterdata\AuditLogsPage.js
import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../api'; // Importa las funciones API
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // Para permisos
import Pagination from '../../components/Pagination';

function AuditLogsPage() {
    const [auditLogs, setAuditLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
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
                            <div className="text-red-600 text-sm">Antes: {String(change.old || 'N/A')}</div>
                            <div className="text-green-600 text-sm">Después: {String(change.new || 'N/A')}</div>
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
                    <div key={field} className="mb-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                        <div className="font-medium text-gray-700 capitalize">{field.replace(/_/g, ' ')}:</div>
                        <div className="text-green-700 text-sm">{String(value)}</div>
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
                    <div key={field} className="mb-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                        <div className="font-medium text-gray-700 capitalize">{field.replace(/_/g, ' ')}:</div>
                        <div className="text-red-700 text-sm">{String(value)}</div>
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
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Registros de Auditoría</h1>

            <div className="bg-white shadow overflow-hidden rounded-lg">
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
                                ID del Registro
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
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {log.record_id || 'N/A'}
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