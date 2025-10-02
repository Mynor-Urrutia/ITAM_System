// itam_frontend/src/pages/assets/ActivoDetailModal.js

import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import MaintenanceModal from './MaintenanceModal';
import MaintenanceDetailModal from './MaintenanceDetailModal';
import Pagination from '../../components/Pagination';
import { getMaintenances } from '../../api';
import { toast } from 'react-toastify';

const ActivoDetailModal = ({ show, onClose, activo, onActivoUpdate }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showMaintenanceDetailModal, setShowMaintenanceDetailModal] = useState(false);
    const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(null);
    const [maintenances, setMaintenances] = useState([]);
    const [maintenancesLoading, setMaintenancesLoading] = useState(false);
    const [maintenancePage, setMaintenancePage] = useState(1);
    const [maintenancePageSize] = useState(5);
    const [maintenanceTotalCount, setMaintenanceTotalCount] = useState(0);
    const [maintenanceTotalPages, setMaintenanceTotalPages] = useState(0);

    useEffect(() => {
        if (show && activo) {
            setMaintenancePage(1); // Reset to first page when activo changes
            fetchMaintenances(1);
        }
    }, [show, activo]);

    useEffect(() => {
        if (show && activo && maintenancePage > 1) {
            fetchMaintenances();
        }
    }, [maintenancePage]);

    const fetchMaintenances = async (page = maintenancePage) => {
        if (!activo) return;
        try {
            setMaintenancesLoading(true);
            const response = await getMaintenances({
                activo: activo.id,
                ordering: '-maintenance_date',
                page: page,
                page_size: maintenancePageSize
            });
            setMaintenances(response.data.results || []);
            setMaintenanceTotalCount(response.data.count || 0);
            setMaintenanceTotalPages(Math.ceil((response.data.count || 0) / maintenancePageSize));
        } catch (error) {
            console.error('Error fetching maintenances:', error);
            toast.error('Error al cargar el historial de mantenimientos.');
        } finally {
            setMaintenancesLoading(false);
        }
    };

    const handleMaintenanceClick = (maintenanceId) => {
        setSelectedMaintenanceId(maintenanceId);
        setShowMaintenanceDetailModal(true);
    };

    const handleMaintenancePageChange = (page) => {
        setMaintenancePage(page);
    };

    if (!activo) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';

        try {
            // Handle both date-only strings and full datetime strings
            let date;
            if (dateString.includes('T') || dateString.includes(' ')) {
                // It's already a datetime string
                date = new Date(dateString);
            } else {
                // It's a date-only string, append time to avoid timezone shift
                date = new Date(dateString + 'T12:00:00');
            }

            // Check if date is valid
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

    const getWarrantyStatus = () => {
        if (!activo.fecha_fin_garantia) return { status: 'Sin garantía', color: 'text-gray-500' };

        const today = new Date();
        const warrantyEnd = new Date(activo.fecha_fin_garantia);

        if (warrantyEnd < today) {
            return { status: 'Vencida', color: 'text-red-600' };
        }

        const daysLeft = Math.ceil((warrantyEnd - today) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 30) {
            return { status: `Vence en ${daysLeft} días`, color: 'text-orange-600' };
        }

        return { status: 'Vigente', color: 'text-green-600' };
    };

    const warrantyStatus = getWarrantyStatus();

    return (
        <>
        <Modal show={show} onClose={onClose} title={`Detalles del Activo: ${activo.hostname}`} size="2xl">
            <div className="flex flex-col h-full">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto min-h-[700px] max-h-[700px]">
                    <div className="space-y-6 pb-6">
                        {/* Header with Warranty Status */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-blue-900">{activo.hostname}</h2>
                                    <p className="text-blue-700">{activo.tipo_activo_name} • {activo.marca_name} • {activo.modelo_name}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-blue-700 mb-1">Estado de Garantía</div>
                                    <div className={`text-lg font-bold ${warrantyStatus.color}`}>{warrantyStatus.status}</div>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('general')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'general'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    General
                                </button>
                                <button
                                    onClick={() => setActiveTab('mantenimiento')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'mantenimiento'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Mantenimiento
                                </button>
                                <button
                                    onClick={() => setActiveTab('pedido')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'pedido'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Pedido
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'general' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Información Principal */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">🏷️ Información Principal</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Número de Serie:</span>
                                            <span className="text-sm text-gray-900">{activo.serie}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Proveedor:</span>
                                            <span className="text-sm text-gray-900">{activo.proveedor_name}</span>
                                        </div>

                                        {/* Especificaciones del Modelo - Solo mostrar campos relevantes por tipo */}
                                        {activo.asset_type_category === 'computo' && (
                                            <>
                                                {activo.procesador && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Procesador:</span>
                                                        <span className="text-sm text-gray-900">{activo.procesador}</span>
                                                    </div>
                                                )}
                                                {activo.ram && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">RAM:</span>
                                                        <span className="text-sm text-gray-900">{activo.ram} GB</span>
                                                    </div>
                                                )}
                                                {activo.almacenamiento && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Almacenamiento:</span>
                                                        <span className="text-sm text-gray-900">{activo.almacenamiento}</span>
                                                    </div>
                                                )}
                                                {activo.tarjeta_grafica && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Tarjeta Gráfica:</span>
                                                        <span className="text-sm text-gray-900">{activo.tarjeta_grafica}</span>
                                                    </div>
                                                )}
                                                {activo.wifi !== null && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">WiFi:</span>
                                                        <span className="text-sm text-gray-900">{activo.wifi ? 'Sí' : 'No'}</span>
                                                    </div>
                                                )}
                                                {activo.ethernet !== null && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Ethernet:</span>
                                                        <span className="text-sm text-gray-900">{activo.ethernet ? 'Sí' : 'No'}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {activo.asset_type_category === 'red' && (
                                            <>
                                                {activo.puertos_ethernet && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Puertos Ethernet:</span>
                                                        <span className="text-sm text-gray-900">{activo.puertos_ethernet}</span>
                                                    </div>
                                                )}
                                                {activo.puertos_sfp && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Puertos SFP:</span>
                                                        <span className="text-sm text-gray-900">{activo.puertos_sfp}</span>
                                                    </div>
                                                )}
                                                {activo.puerto_consola !== null && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Puerto Consola:</span>
                                                        <span className="text-sm text-gray-900">{activo.puerto_consola ? 'Sí' : 'No'}</span>
                                                    </div>
                                                )}
                                                {activo.puertos_poe && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Puertos PoE:</span>
                                                        <span className="text-sm text-gray-900">{activo.puertos_poe}</span>
                                                    </div>
                                                )}
                                                {activo.alimentacion && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Alimentación:</span>
                                                        <span className="text-sm text-gray-900">{activo.alimentacion}</span>
                                                    </div>
                                                )}
                                                {activo.administrable !== null && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Administrable:</span>
                                                        <span className="text-sm text-gray-900">{activo.administrable ? 'Sí' : 'No'}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {activo.asset_type_category === 'periferico' && (
                                            <>
                                                {activo.tamano && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Tamaño:</span>
                                                        <span className="text-sm text-gray-900">{activo.tamano}</span>
                                                    </div>
                                                )}
                                                {activo.color && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Color:</span>
                                                        <span className="text-sm text-gray-900">{activo.color}</span>
                                                    </div>
                                                )}
                                                {activo.conectores && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Conectores:</span>
                                                        <span className="text-sm text-gray-900">{activo.conectores}</span>
                                                    </div>
                                                )}
                                                {activo.cables && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-600">Cables:</span>
                                                        <span className="text-sm text-gray-900">{activo.cables}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* Fallback: mostrar campos básicos si no hay categoría definida */}
                                        {(!activo.asset_type_category || activo.asset_type_category === 'periferico') && !activo.procesador && !activo.puertos_ethernet && !activo.tamano && (
                                            <div className="text-sm text-gray-500 italic">
                                                No hay especificaciones técnicas disponibles para este modelo.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ubicación */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">📍 Ubicación</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Región:</span>
                                            <span className="text-sm text-gray-900">{activo.region_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Finca:</span>
                                            <span className="text-sm text-gray-900">{activo.finca_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Departamento:</span>
                                            <span className="text-sm text-gray-900">{activo.departamento_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Área:</span>
                                            <span className="text-sm text-gray-900">{activo.area_name}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Información del Sistema */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Sistema</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Registrado por:</span>
                                            <span className="text-sm text-gray-900">{activo.created_by_user || 'Desconocido'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Fecha de Registro:</span>
                                            <span className="text-sm text-gray-900">{formatDate(activo.created_at)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-600">Última Actualización:</span>
                                            <span className="text-sm text-gray-900">{formatDate(activo.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fechas Importantes */}
                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">📅 Fechas Importantes</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">Fecha Inicio Garantía:</span>
                                            <p className="text-base font-semibold text-gray-900">{formatDate(activo.fecha_registro)}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-600">Fin de Garantía:</span>
                                            <p className={`text-base font-semibold ${warrantyStatus.color}`}>{formatDate(activo.fecha_fin_garantia)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Información de Baja - Solo para activos retirados */}
                                {activo.estado === 'retirado' && (
                                    <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">🚫 Información de Baja</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Fecha de Baja:</span>
                                                <span className="text-sm text-gray-900">{formatDate(activo.fecha_baja)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Usuario que dio de Baja:</span>
                                                <span className="text-sm text-gray-900">{activo.usuario_baja_name || 'Desconocido'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-600 mb-1">Motivo de Baja:</span>
                                                <span className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">{activo.motivo_baja || 'No especificado'}</span>
                                            </div>
                                            {activo.documentos_baja && activo.documentos_baja.length > 0 && (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-600 mb-2">Documentos Adjuntos:</span>
                                                    <div className="space-y-1">
                                                        {activo.documentos_baja.map((docPath, index) => {
                                                            const fileName = docPath.split('/').pop();
                                                            const fileUrl = `http://127.0.0.1:8000/media/${docPath}`;
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
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                       {activeTab === 'mantenimiento' && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {/* Información de Mantenimiento */}
                               <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                                   <h3 className="text-lg font-semibold text-gray-800 mb-3">🔧 Información de Mantenimiento</h3>
                                   <div className="space-y-2">
                                       <div className="flex justify-between">
                                           <span className="text-sm font-medium text-gray-600">Último Mantenimiento:</span>
                                           <span className="text-sm text-gray-900">{activo.ultimo_mantenimiento ? formatDate(activo.ultimo_mantenimiento) : 'Nunca'}</span>
                                       </div>
                                       <div className="flex justify-between">
                                           <span className="text-sm font-medium text-gray-600">Próximo Mantenimiento:</span>
                                           <span className={`text-sm font-semibold ${activo.proximo_mantenimiento && new Date(activo.proximo_mantenimiento) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                                               {activo.proximo_mantenimiento ? formatDate(activo.proximo_mantenimiento) : 'No programado'}
                                           </span>
                                       </div>
                                       {activo.tecnico_mantenimiento_name && (
                                           <div className="flex justify-between">
                                               <span className="text-sm font-medium text-gray-600">Último Técnico:</span>
                                               <span className="text-sm text-gray-900">{activo.tecnico_mantenimiento_name}</span>
                                           </div>
                                       )}
                                       <div className="flex flex-col">
                                           <span className="text-sm font-medium text-gray-600 mb-1">Últimos Hallazgos:</span>
                                           <span className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">{activo.ultimo_mantenimiento_hallazgos || 'No hay hallazgos registrados'}</span>
                                       </div>
                                       {activo.ultimo_mantenimiento_adjuntos && activo.ultimo_mantenimiento_adjuntos.length > 0 && (
                                           <div className="flex flex-col">
                                               <span className="text-sm font-medium text-gray-600 mb-2">Archivos Adjuntos del Último Mantenimiento:</span>
                                               <div className="space-y-1">
                                                   {activo.ultimo_mantenimiento_adjuntos.map((filePath, index) => {
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
                                   </div>
                               </div>

                               {/* Historial de Mantenimientos */}
                               <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                   <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Historial de Mantenimientos</h3>

                                   {maintenancesLoading ? (
                                       <div className="text-center py-4">
                                           <div className="text-gray-500">Cargando historial...</div>
                                       </div>
                                   ) : maintenances.length === 0 ? (
                                       <div className="text-center py-4">
                                           <div className="text-gray-500">No hay mantenimientos registrados para este activo.</div>
                                       </div>
                                   ) : (
                                       <>
                                           <div className="overflow-x-auto">
                                               <table className="min-w-full divide-y divide-gray-200">
                                                   <thead className="bg-gray-50">
                                                       <tr>
                                                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Mantenimiento</th>
                                                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                                                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Próximo Mantenimiento</th>
                                                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Archivos</th>
                                                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                                       </tr>
                                                   </thead>
                                                   <tbody className="bg-white divide-y divide-gray-200">
                                                       {maintenances.map((maintenance) => (
                                                           <tr key={maintenance.id} className="hover:bg-gray-50">
                                                               <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                   {formatDate(maintenance.maintenance_date)}
                                                               </td>
                                                               <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                   {maintenance.technician_name}
                                                               </td>
                                                               <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                   {formatDate(maintenance.next_maintenance_date)}
                                                               </td>
                                                               <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                                   {maintenance.attachments && maintenance.attachments.length > 0 ? `${maintenance.attachments.length} archivo(s)` : 'No hay archivos'}
                                                               </td>
                                                               <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                                                   <button
                                                                       onClick={() => handleMaintenanceClick(maintenance.id)}
                                                                       className="text-blue-600 hover:text-blue-900 hover:underline"
                                                                   >
                                                                       Ver Detalles
                                                                   </button>
                                                               </td>
                                                           </tr>
                                                       ))}
                                                   </tbody>
                                               </table>
                                           </div>

                                           {/* Pagination for Maintenance History */}
                                           {maintenanceTotalPages > 1 && (
                                               <div className="mt-4">
                                                   <Pagination
                                                       currentPage={maintenancePage}
                                                       totalPages={maintenanceTotalPages}
                                                       pageSize={maintenancePageSize}
                                                       pageSizeOptions={[5, 10, 20, 50]}
                                                       onPageChange={handleMaintenancePageChange}
                                                       onPageSizeChange={() => {}} // No page size change needed
                                                       hidePageSize={true} // Hide page size selector for maintenance history
                                                   />
                                               </div>
                                           )}
                                       </>
                                   )}
                               </div>
                           </div>
                       )}

                       {activeTab === 'pedido' && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {/* Información del Solicitante del Equipo */}
                               <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                   <h3 className="text-lg font-semibold text-gray-800 mb-3">👤 Información del Solicitante del Equipo</h3>
                                   <div className="space-y-2">
                                       <div className="flex justify-between">
                                           <span className="text-sm font-medium text-gray-600">Solicitante:</span>
                                           <span className="text-sm text-gray-900">{activo.solicitante || 'No especificado'}</span>
                                       </div>
                                       <div className="flex justify-between">
                                           <span className="text-sm font-medium text-gray-600">Correo:</span>
                                           <span className="text-sm text-gray-900">{activo.correo_electronico || 'No especificado'}</span>
                                       </div>
                                       <div className="flex justify-between">
                                           <span className="text-sm font-medium text-gray-600">Orden de Compra:</span>
                                           <span className="text-sm text-gray-900">{activo.orden_compra || 'No especificado'}</span>
                                       </div>
                                       {activo.cuenta_contable && (
                                           <div className="flex justify-between">
                                               <span className="text-sm font-medium text-gray-600">Cuenta Contable:</span>
                                               <span className="text-sm text-gray-900">{activo.cuenta_contable}</span>
                                           </div>
                                       )}
                                       {activo.tipo_costo && (
                                           <div className="flex justify-between">
                                               <span className="text-sm font-medium text-gray-600">Tipo de Costo:</span>
                                               <span className="text-sm text-gray-900">{activo.tipo_costo === 'costo' ? 'Costo' : 'Mensualidad'}</span>
                                           </div>
                                       )}
                                       {activo.cuotas && (
                                           <div className="flex justify-between">
                                               <span className="text-sm font-medium text-gray-600">Cuotas:</span>
                                               <span className="text-sm text-gray-900">{activo.cuotas} meses</span>
                                           </div>
                                       )}
                                       {activo.moneda && (
                                           <div className="flex justify-between">
                                               <span className="text-sm font-medium text-gray-600">Moneda:</span>
                                               <span className="text-sm text-gray-900">{activo.moneda === 'USD' ? 'Dólares' : 'Quetzales'}</span>
                                           </div>
                                       )}
                                       {activo.costo && (
                                           <div className="flex justify-between">
                                               <span className="text-sm font-medium text-gray-600">Costo:</span>
                                               <span className="text-sm text-gray-900">{parseFloat(activo.costo).toLocaleString('es-GT', { style: 'currency', currency: activo.moneda === 'USD' ? 'USD' : 'GTQ' })}</span>
                                           </div>
                                       )}
                                   </div>
                               </div>
                           </div>
                       )}
                    </div>
                </div>

                {/* Fixed Footer with Buttons */}
                <div className="flex-shrink-0 pt-4 border-t bg-white">
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setShowMaintenanceModal(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                        >
                            Registrar Mantenimiento
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </Modal>

        <MaintenanceModal
            show={showMaintenanceModal}
            onClose={() => setShowMaintenanceModal(false)}
            activo={activo}
            onMaintenanceSuccess={() => {
                setShowMaintenanceModal(false);
                if (onActivoUpdate) onActivoUpdate();
                fetchMaintenances(); // Refresh maintenance history
            }}
        />

        <MaintenanceDetailModal
            show={showMaintenanceDetailModal}
            onClose={() => setShowMaintenanceDetailModal(false)}
            maintenanceId={selectedMaintenanceId}
        />
        </>
    );
};

export default ActivoDetailModal;