// itam_frontend/src/pages/assets/MaintenancePage.js

import React, { useState, useEffect } from 'react';
import { getMaintenanceOverview } from '../../api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import MaintenanceModal from './MaintenanceModal';
import MaintenanceDetailModal from './MaintenanceDetailModal';

function MaintenancePage() {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [activeTab, setActiveTab] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();

    // Maintenance modal state
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [selectedActivo, setSelectedActivo] = useState(null);

    // Maintenance detail modal state
    const [showMaintenanceDetailModal, setShowMaintenanceDetailModal] = useState(false);
    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);

    const canViewMaintenance = hasPermission('assets.view_mantenimiento');
    const canCreateMaintenance = hasPermission('assets.add_mantenimiento');

    useEffect(() => {
        if (canViewMaintenance) {
            fetchMaintenanceData();
        }
    }, [canViewMaintenance]);

    useEffect(() => {
        filterData();
    }, [maintenanceData, activeTab, searchTerm]);

    const fetchMaintenanceData = async () => {
        try {
            setLoading(true);
            const response = await getMaintenanceOverview();
            setMaintenanceData(response.data);
        } catch (error) {
            console.error('Error fetching maintenance data:', error);
            toast.error('Error al cargar los datos de mantenimiento.');
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        let filtered = maintenanceData;

        // Filter by tab
        if (activeTab !== 'todos') {
            filtered = filtered.filter(item => item.status === activeTab);
        }

        // Filter by search term (hostname or serie)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(item =>
                item.hostname.toLowerCase().includes(term) ||
                item.serie.toLowerCase().includes(term)
            );
        }

        setFilteredData(filtered);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'realizados':
                return 'Realizados';
            case 'proximos':
                return 'Próximos';
            case 'nunca':
                return 'Nunca';
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'realizados':
                return 'bg-green-100 text-green-800';
            case 'proximos':
                return 'bg-yellow-100 text-yellow-800';
            case 'nunca':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        // Append time to avoid timezone shift
        const date = new Date(dateString + 'T12:00:00');
        return date.toLocaleDateString('es-ES');
    };

    const handleRegisterMaintenance = (activo) => {
        setSelectedActivo(activo);
        setShowMaintenanceModal(true);
    };

    const handleViewMaintenanceDetails = (maintenanceId) => {
        setSelectedMaintenanceId(maintenanceId);
        setShowMaintenanceDetailModal(true);
    };

    const handleMaintenanceSuccess = () => {
        fetchMaintenanceData(); // Refresh the data
    };

    if (!canViewMaintenance) {
        return (
            <div className="p-4">
                <div className="text-center text-gray-500">
                    No tienes permisos para ver esta página.
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Vista General de Mantenimientos
                    </h1>
                    <div className="flex items-center space-x-4">
                        {/* Search Box */}
                        <div className="relative">
                            <label htmlFor="search" className="sr-only">Buscar por Hostname o Serie</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Buscar por hostname o serie..."
                            />
                        </div>
                        {canCreateMaintenance && (
                            <button
                                onClick={() => handleRegisterMaintenance(null)}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                            >
                                Registrar Mantenimiento Manual
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-4">
                <nav className="flex space-x-4" aria-label="Tabs">
                    {[
                        { key: 'todos', label: 'Todos' },
                        { key: 'realizados', label: 'Realizados' },
                        { key: 'proximos', label: 'Próximos' },
                        { key: 'nunca', label: 'Nunca' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                activeTab === tab.key
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="text-gray-500">Cargando datos...</div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hostname
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Serie
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Marca
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Modelo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Último Mantenimiento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Próximo Mantenimiento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Región
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Finca
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Técnico
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                                        No hay datos disponibles.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.hostname}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.serie}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.marca}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.modelo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(item.ultimo_mantenimiento)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(item.proximo_mantenimiento)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.region}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.finca}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.tecnico_mantenimiento || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {getStatusLabel(item.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {item.maintenance_id && (
                                                    <button
                                                        onClick={() => handleViewMaintenanceDetails(item.maintenance_id)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md"
                                                        title="Ver Detalles del Mantenimiento"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {canCreateMaintenance && (
                                                    <button
                                                        onClick={() => handleRegisterMaintenance(item)}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md"
                                                        title="Registrar Mantenimiento"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Maintenance Modal */}
            {showMaintenanceModal && (
                <MaintenanceModal
                    show={showMaintenanceModal}
                    onClose={() => setShowMaintenanceModal(false)}
                    activo={selectedActivo}
                    onMaintenanceSuccess={handleMaintenanceSuccess}
                />
            )}

            {/* Maintenance Detail Modal */}
            {showMaintenanceDetailModal && selectedMaintenanceId && (
                <MaintenanceDetailModal
                    show={showMaintenanceDetailModal}
                    onClose={() => setShowMaintenanceDetailModal(false)}
                    maintenanceId={selectedMaintenanceId}
                />
            )}
        </div>
    );
}

export default MaintenancePage;