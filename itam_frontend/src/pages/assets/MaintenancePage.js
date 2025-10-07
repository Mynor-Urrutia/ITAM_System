// itam_frontend/src/pages/assets/MaintenancePage.js

import React, { useState, useEffect } from 'react';
import { getMaintenanceOverview } from '../../api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import MaintenanceModal from './MaintenanceModal';
import MaintenanceDetailModal from './MaintenanceDetailModal';
import Pagination from '../../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faSort, faSortUp, faSortDown, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

function MaintenancePage() {
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [activeTab, setActiveTab] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('hostname');
    const [sortDirection, setSortDirection] = useState('asc');
    const [loading, setLoading] = useState(true);
    const [expandedCards, setExpandedCards] = useState(new Set());
    const { hasPermission } = useAuth();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSizeOptions = [5, 10, 20, 50];

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
    }, [canViewMaintenance, currentPage, pageSize, sortField, sortDirection]);

    useEffect(() => {
        filterData();
    }, [maintenanceData, activeTab, searchTerm]);

    const fetchMaintenanceData = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                page_size: pageSize,
                ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
            };
            const response = await getMaintenanceOverview(params);
            setMaintenanceData(response.data.results);
            setTotalPages(Math.ceil(response.data.count / pageSize));
            setTotalCount(response.data.count);
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
            case 'vencidos':
                return 'Vencidos';
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
            case 'vencidos':
                return 'bg-red-100 text-red-800';
            case 'nunca':
                return 'bg-gray-100 text-gray-800';
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

    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle direction if same field
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to ascending
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) {
            return 'fa-sort';
        }
        return sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };

    const toggleCardExpansion = (itemId) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedCards(newExpanded);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
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
        <div className="p-2 sm:p-4 relative min-h-screen">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
                {/* Title */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 text-center">Vista General de Mantenimientos</h1>
                </div>

                {/* Search Box for Mobile */}
                <div className="mb-4">
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
                </div>

                {/* Tabs for Mobile */}
                <div className="mb-4">
                    <nav className="flex space-x-2" aria-label="Tabs">
                        {[
                            { key: 'todos', label: 'Todos' },
                            { key: 'realizados', label: 'Realizados' },
                            { key: 'proximos', label: 'Próximos' },
                            { key: 'vencidos', label: 'Vencidos' },
                            { key: 'nunca', label: 'Nunca' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-2 py-1 rounded-md text-xs font-medium ${
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
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:block mb-6">
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

        {/* Desktop Tabs */}
            <div className="hidden sm:block mb-4">
                <nav className="flex space-x-4" aria-label="Tabs">
                    {[
                        { key: 'todos', label: 'Todos' },
                        { key: 'realizados', label: 'Realizados' },
                        { key: 'proximos', label: 'Próximos' },
                        { key: 'vencidos', label: 'Vencidos' },
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
                <div>
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-4">
                        {filteredData.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No hay datos disponibles.</p>
                        ) : (
                            filteredData.map((item) => {
                                const isExpanded = expandedCards.has(item.id);
                                return (
                                    <div key={item.id} className="bg-white rounded-lg shadow border">
                                        {/* Header - Always visible */}
                                        <div className="p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{item.hostname}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Serie:</span> {item.serie}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                        {getStatusLabel(item.status)}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleCardExpansion(item.id)}
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
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Marca:</span> {item.marca}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Modelo:</span> {item.modelo}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Último Mantenimiento:</span> {formatDate(item.ultimo_mantenimiento)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Próximo Mantenimiento:</span> {formatDate(item.proximo_mantenimiento)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Región:</span> {item.region}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Finca:</span> {item.finca}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Técnico:</span> {item.tecnico_mantenimiento || 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {item.maintenance_id && (
                                                        <button
                                                            onClick={() => handleViewMaintenanceDetails(item.maintenance_id)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                                            title="Ver Detalles del Mantenimiento"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                                                            Ver Detalles
                                                        </button>
                                                    )}
                                                    {canCreateMaintenance && (
                                                        <button
                                                            onClick={() => handleRegisterMaintenance(item)}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                                                            title="Registrar Mantenimiento"
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                                            Registrar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block bg-white shadow overflow-hidden rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('hostname')}>
                                    <div className="flex items-center">
                                        Hostname
                                        <FontAwesomeIcon icon={getSortIcon('hostname')} className="ml-1 text-xs" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('serie')}>
                                    <div className="flex items-center">
                                        Serie
                                        <FontAwesomeIcon icon={getSortIcon('serie')} className="ml-1 text-xs" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('marca')}>
                                    <div className="flex items-center">
                                        Marca
                                        <FontAwesomeIcon icon={getSortIcon('marca')} className="ml-1 text-xs" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('modelo')}>
                                    <div className="flex items-center">
                                        Modelo
                                        <FontAwesomeIcon icon={getSortIcon('modelo')} className="ml-1 text-xs" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('ultimo_mantenimiento')}>
                                    <div className="flex items-center">
                                        Último Mantenimiento
                                        <FontAwesomeIcon icon={getSortIcon('ultimo_mantenimiento')} className="ml-1 text-xs" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('proximo_mantenimiento')}>
                                    <div className="flex items-center">
                                        Próximo Mantenimiento
                                        <FontAwesomeIcon icon={getSortIcon('proximo_mantenimiento')} className="ml-1 text-xs" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('region')}>
                                    <div className="flex items-center">
                                        Región
                                        <FontAwesomeIcon icon={getSortIcon('region')} className="ml-1 text-xs" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('finca')}>
                                    <div className="flex items-center">
                                        Finca
                                        <FontAwesomeIcon icon={getSortIcon('finca')} className="ml-1 text-xs" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('tecnico_mantenimiento')}>
                                    <div className="flex items-center">
                                        Técnico
                                        <FontAwesomeIcon icon={getSortIcon('tecnico_mantenimiento')} className="ml-1 text-xs" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                                    <div className="flex items-center">
                                        Estado
                                        <FontAwesomeIcon icon={getSortIcon('status')} className="ml-1 text-xs" />
                                    </div>
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
                    </div>
                </div>
            )}

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

            {/* Mobile Floating Action Button */}
            {canCreateMaintenance && (
                <div className="block sm:hidden fixed bottom-6 right-6 z-10">
                    <button
                        onClick={() => handleRegisterMaintenance(null)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                        title="Registrar Mantenimiento Manual"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xl" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default MaintenancePage;