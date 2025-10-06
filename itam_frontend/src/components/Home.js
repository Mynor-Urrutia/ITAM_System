// src/components/Home.js
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getDashboardData, getDashboardModelsData, getDashboardSummary, getDashboardDetailData, getDashboardWarrantyData, getMaintenanceOverview } from '../api';

ChartJS.register(ArcElement, Tooltip, Legend);

function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [modelsData, setModelsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [warrantyData, setWarrantyData] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carousel state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [modalSort, setModalSort] = useState('serie');
  const [modalPage, setModalPage] = useState(1);

  // Warranty filter state
  const [selectedWarrantyTypes, setSelectedWarrantyTypes] = useState([]);

  // Maintenance filter state
  const [selectedMaintenanceRegions, setSelectedMaintenanceRegions] = useState([]);
  const [selectedMaintenanceTypes, setSelectedMaintenanceTypes] = useState([]);
  const [selectedMaintenanceStatuses, setSelectedMaintenanceStatuses] = useState(['nunca', 'proximos', 'realizados']); // Default to all

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data individually to better handle errors
        const dashboardResponse = await getDashboardData();
        setDashboardData(dashboardResponse.data);

        const modelsResponse = await getDashboardModelsData();
        setModelsData(modelsResponse.data);

        const warrantyResponse = await getDashboardWarrantyData();
        setWarrantyData(warrantyResponse.data);

        const maintenanceResponse = await getMaintenanceOverview();
        setMaintenanceData(maintenanceResponse.data.results || maintenanceResponse.data);


        // Try to fetch summary data, but don't fail if it doesn't work
        try {
          const summaryResponse = await getDashboardSummary();
          setSummaryData(summaryResponse.data);
        } catch (summaryErr) {
          console.warn('Could not load summary data:', summaryErr);
          // Set empty summary data so the UI still works
          setSummaryData({
            total_assets: 0,
            asset_types: []
          });
        }

      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error('Dashboard error:', err);
        // Set default empty data so the UI doesn't break completely
        setDashboardData(null);
        setModelsData(null);
        setSummaryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && summaryData && summaryData.asset_types && summaryData.asset_types.length > 3) {
      const interval = setInterval(() => {
        setCurrentCardIndex((prevIndex) => {
          const maxIndex = Math.max(0, summaryData.asset_types.length - 3);
          return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
      }, 5000); // 5 seconds

      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, summaryData]);

  // Restart auto-play after manual navigation
  useEffect(() => {
    if (!isAutoPlaying) {
      const timeout = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 10000); // Restart auto-play after 10 seconds of inactivity

      return () => clearTimeout(timeout);
    }
  }, [isAutoPlaying]);

  const handleCardClick = async (category, title) => {
    setModalLoading(true);
    setShowModal(true);
    setModalTitle(title);
    setModalCategory(category);
    setModalSort('serie');
    setModalPage(1);

    try {
      const response = await getDashboardDetailData(category, modalSort, modalPage);
      setModalData(response.data);
    } catch (err) {
      console.error('Error loading modal data:', err);
      setModalData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSort = async (field) => {
    const newSort = modalSort === field ? `-${field}` : field;
    setModalSort(newSort);
    setModalPage(1); // Reset to first page when sorting

    setModalLoading(true);
    try {
      const response = await getDashboardDetailData(modalCategory, newSort, 1);
      setModalData(response.data);
    } catch (err) {
      console.error('Error sorting modal data:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    setModalPage(newPage);
    setModalLoading(true);
    try {
      const response = await getDashboardDetailData(modalCategory, modalSort, newPage);
      setModalData(response.data);
    } catch (err) {
      console.error('Error changing page:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
    setModalTitle('');
    setModalCategory('');
    setModalSort('serie');
    setModalPage(1);
  };

  // Carousel functions
  const nextCard = () => {
    if (summaryData && summaryData.asset_types) {
      const maxIndex = Math.max(0, summaryData.asset_types.length - 3);
      setCurrentCardIndex((prevIndex) =>
        prevIndex >= maxIndex ? 0 : prevIndex + 1
      );
    }
  };

  const prevCard = () => {
    if (summaryData && summaryData.asset_types) {
      const maxIndex = Math.max(0, summaryData.asset_types.length - 3);
      setCurrentCardIndex((prevIndex) =>
        prevIndex <= 0 ? maxIndex : prevIndex - 1
      );
    }
  };

  const goToCard = (index) => {
    if (summaryData && summaryData.asset_types) {
      const maxIndex = Math.max(0, summaryData.asset_types.length - 3);
      setCurrentCardIndex(Math.min(index, maxIndex));
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 md:p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard ITAM</h1>

      {/* Summary Cards Section */}
      {summaryData && !loading && summaryData.asset_types && summaryData.asset_types.length > 0 && (
        <div className="mb-6">

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Total Assets Card - Outside Carousel */}
            <div className="lg:w-1/4">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white cursor-pointer hover:shadow-lg transition-shadow h-full"
                onClick={() => handleCardClick('total_assets', 'Total de Activos')}
              >
                <div className="flex items-center h-full">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">∑</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-100">Total Activos</p>
                    <p className="text-3xl font-bold">{summaryData.total_assets || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Types Carousel */}
            <div
              className="lg:w-3/4 bg-white rounded-lg shadow-md p-4"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className="relative">
                {/* Cards Container - Show 3 cards at once */}
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${(currentCardIndex * 100) / 3}%)` }}
                  >
                    {summaryData.asset_types.map((assetType, index) => {
                      const colors = [
                        'from-purple-500 to-purple-600',
                        'from-green-500 to-green-600',
                        'from-yellow-500 to-yellow-600',
                        'from-red-500 to-red-600',
                        'from-indigo-500 to-indigo-600',
                        'from-pink-500 to-pink-600',
                        'from-gray-500 to-gray-600'
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <div key={assetType.tipo_activo} className="w-1/3 flex-shrink-0 px-2">
                          <div
                            className={`bg-gradient-to-r ${color} rounded-lg p-3 text-white cursor-pointer hover:shadow-lg transition-shadow`}
                            onClick={() => handleCardClick(assetType.tipo_activo, assetType.tipo_activo)}
                          >
                            <div className="mb-2">
                              <h3 className="text-base font-semibold">{assetType.tipo_activo}</h3>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="opacity-90">Total:</span>
                                <span className="font-bold">{assetType.total_equipment}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-90">Garantía Vigente:</span>
                                <span className="font-bold">{assetType.valid_warranty}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-90">Próxima (30d):</span>
                                <span className="font-bold">{assetType.expiring_warranty}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-90">Sin Garantía:</span>
                                <span className="font-bold">{assetType.no_warranty}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Buttons */}
                {summaryData.asset_types.length > 3 && (
                  <>
                    <button
                      onClick={() => {
                        prevCard();
                        setIsAutoPlaying(false);
                      }}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        nextCard();
                        setIsAutoPlaying(false);
                      }}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {summaryData.asset_types.length > 3 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: Math.max(1, summaryData.asset_types.length - 2) }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          goToCard(index);
                          setIsAutoPlaying(false);
                        }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentCardIndex ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Alerts Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
        {/* Warranty Expiration Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Garantías Próximas a Vencer</h2>

          {/* Filter Controls */}
          {warrantyData && warrantyData.warranty_assets && warrantyData.warranty_assets.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Tipo de Activo:
              </label>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  // Get unique asset types from warranty data
                  const uniqueTypes = [...new Set(warrantyData.warranty_assets.map(asset => asset.tipo_activo))].filter(Boolean);
                  return uniqueTypes.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedWarrantyTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWarrantyTypes([...selectedWarrantyTypes, type]);
                          } else {
                            setSelectedWarrantyTypes(selectedWarrantyTypes.filter(t => t !== type));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ));
                })()}
                {selectedWarrantyTypes.length > 0 && (
                  <button
                    onClick={() => setSelectedWarrantyTypes([])}
                    className="ml-4 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}

          {warrantyData && warrantyData.warranty_assets && warrantyData.warranty_assets.length > 0 ? (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left">Fecha Vencimiento</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Tipo</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Región</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Marca</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Modelo</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Serie</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Hostname</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Filter assets based on selected types
                    const filteredAssets = selectedWarrantyTypes.length > 0
                      ? warrantyData.warranty_assets.filter(asset => selectedWarrantyTypes.includes(asset.tipo_activo))
                      : warrantyData.warranty_assets;

                    return filteredAssets.slice(0, 10).map((asset, index) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-1">
                          {new Date(asset.fecha_vencimiento_garantia).toLocaleDateString('es-GT')}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">{asset.tipo_activo}</td>
                        <td className="border border-gray-300 px-2 py-1">{asset.region}</td>
                        <td className="border border-gray-300 px-2 py-1">{asset.marca}</td>
                        <td className="border border-gray-300 px-2 py-1">{asset.modelo}</td>
                        <td className="border border-gray-300 px-2 py-1">{asset.serie}</td>
                        <td className="border border-gray-300 px-2 py-1">{asset.hostname}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay garantías próximas a vencer</p>
          )}
        </div>

        {/* Upcoming Maintenance Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Mantenimientos Próximos</h2>

          {/* Filter Controls - Show if data exists */}
          {maintenanceData && Array.isArray(maintenanceData) && maintenanceData.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Región:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Get unique regions from maintenance data
                    const uniqueRegions = [...new Set(maintenanceData.map(item => item.region))].filter(Boolean);
                    return uniqueRegions.map(region => (
                      <label key={region} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedMaintenanceRegions.includes(region)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMaintenanceRegions([...selectedMaintenanceRegions, region]);
                            } else {
                              setSelectedMaintenanceRegions(selectedMaintenanceRegions.filter(r => r !== region));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{region}</span>
                      </label>
                    ));
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Tipo de Equipo:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    // Get unique types from maintenance data
                    const uniqueTypes = [...new Set(maintenanceData.map(item => item.tipo))].filter(Boolean);
                    return uniqueTypes.map(tipo => (
                      <label key={tipo} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedMaintenanceTypes.includes(tipo)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMaintenanceTypes([...selectedMaintenanceTypes, tipo]);
                            } else {
                              setSelectedMaintenanceTypes(selectedMaintenanceTypes.filter(t => t !== tipo));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{tipo}</span>
                      </label>
                    ));
                  })()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Estado de Mantenimiento:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'nunca', label: 'Nunca' },
                    { key: 'proximos', label: 'Próximos' },
                    { key: 'realizados', label: 'Realizados' }
                  ].map(status => (
                    <label key={status.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedMaintenanceStatuses.includes(status.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMaintenanceStatuses([...selectedMaintenanceStatuses, status.key]);
                          } else {
                            setSelectedMaintenanceStatuses(selectedMaintenanceStatuses.filter(s => s !== status.key));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(selectedMaintenanceRegions.length > 0 || selectedMaintenanceTypes.length > 0 || selectedMaintenanceStatuses.length < 3) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMaintenanceRegions([]);
                      setSelectedMaintenanceTypes([]);
                      setSelectedMaintenanceStatuses(['nunca', 'proximos', 'realizados']);
                    }}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Table Content */}
          <div>
            {maintenanceData && Array.isArray(maintenanceData) && maintenanceData.length > 0 ? (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-2 py-1 text-left">Activo</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Tipo</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Modelo</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Ultimo Matto</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Proximo Mantto</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Región</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Finca</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Técnico</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Filter assets by selected statuses
                      let filteredAssets = maintenanceData.filter(item =>
                        selectedMaintenanceStatuses.includes(item.status)
                      );

                      if (selectedMaintenanceRegions.length > 0) {
                        filteredAssets = filteredAssets.filter(item => selectedMaintenanceRegions.includes(item.region));
                      }

                      if (selectedMaintenanceTypes.length > 0) {
                        filteredAssets = filteredAssets.filter(item => selectedMaintenanceTypes.includes(item.tipo));
                      }

                      return filteredAssets.length > 0 ? filteredAssets.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1">
                            <div>
                              <div className="font-medium">{item.hostname}</div>
                              <div className="text-xs text-gray-500">{item.serie}</div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-2 py-1">{item.tipo}</td>
                          <td className="border border-gray-300 px-2 py-1">{item.modelo}</td>
                          <td className="border border-gray-300 px-2 py-1">
                            {item.ultimo_mantenimiento ?
                              new Date(item.ultimo_mantenimiento).toLocaleDateString('es-GT') :
                              'Nunca'
                            }
                          </td>
                          <td className="border border-gray-300 px-2 py-1">
                            {item.proximo_mantenimiento ?
                              new Date(item.proximo_mantenimiento).toLocaleDateString('es-GT') :
                              'No programado'
                            }
                          </td>
                          <td className="border border-gray-300 px-2 py-1">{item.region}</td>
                          <td className="border border-gray-300 px-2 py-1">{item.finca}</td>
                          <td className="border border-gray-300 px-2 py-1">{item.tecnico_mantenimiento || item.usuario}</td>
                          <td className="border border-gray-300 px-2 py-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'nunca' ? 'bg-red-100 text-red-800' :
                              item.status === 'proximos' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.status === 'nunca' ? 'Nunca' :
                               item.status === 'proximos' ? 'Próximos' :
                               'Realizado'}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="9" className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                            No hay activos que coincidan con los filtros seleccionados
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {loading ? 'Cargando datos de mantenimiento...' : 'No hay datos de mantenimiento disponibles'}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Pie Chart Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Distribución de Tipos de Equipo</h2>
        {summaryData && summaryData.asset_types && summaryData.asset_types.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm">
              {(() => {
                // Sort asset types by total_equipment in descending order
                const sortedAssetTypes = [...summaryData.asset_types].sort((a, b) => b.total_equipment - a.total_equipment);

                return (
                  <Pie
                    data={{
                      labels: sortedAssetTypes.map(type => type.tipo_activo),
                      datasets: [{
                        data: sortedAssetTypes.map(type => type.total_equipment),
                        backgroundColor: [
                          '#3B82F6', // Blue
                          '#10B981', // Green
                          '#F59E0B', // Yellow
                          '#EF4444', // Red
                          '#8B5CF6', // Purple
                          '#06B6D4', // Cyan
                          '#84CC16', // Lime
                          '#F97316', // Orange
                          '#EC4899', // Pink
                          '#6B7280', // Gray
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff',
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                              size: 12
                            }
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                          }
                        }
                      },
                    }}
                  />
                );
              })()}
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-600">
                Total de equipos: <span className="font-semibold">{summaryData.total_assets}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-500 text-sm">No hay datos disponibles para la gráfica</p>
          </div>
        )}
      </div>


      {/* Modal for detailed asset information */}
      <Modal show={showModal} onClose={closeModal} title={modalTitle} size="xl">
        {modalLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Cargando datos...</div>
          </div>
        ) : modalData && modalData.assets ? (
          <div>
            {/* Warranty Status Legend */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Estado de Garantía:</h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                  <span>Vigente ({'>'}30 días)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
                  <span>Próxima (≤30 días)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
                  <span>Vencida</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                  <span>Sin Garantía</span>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="block sm:hidden max-h-96 overflow-y-auto space-y-4">
              {modalData.assets.map((asset) => {
                // Calculate warranty status for color coding
                const getWarrantyStatus = (fechaFinGarantia) => {
                  if (!fechaFinGarantia) return 'no-warranty';

                  const warrantyDate = new Date(fechaFinGarantia);
                  const today = new Date();
                  const thirtyDaysFromNow = new Date();
                  thirtyDaysFromNow.setDate(today.getDate() + 30);

                  if (warrantyDate < today) return 'expired';
                  if (warrantyDate <= thirtyDaysFromNow) return 'expiring';
                  return 'valid';
                };

                const warrantyStatus = getWarrantyStatus(asset.fecha_fin_garantia);

                return (
                  <div key={asset.id} className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{asset.hostname}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        warrantyStatus === 'valid' ? 'bg-green-100 text-green-800' :
                        warrantyStatus === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                        warrantyStatus === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {warrantyStatus === 'valid' ? 'Vigente' :
                         warrantyStatus === 'expiring' ? 'Próxima' :
                         warrantyStatus === 'expired' ? 'Vencida' : 'Sin Garantía'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Serie:</span> {asset.serie}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Tipo/Marca/Modelo:</span> {asset.tipo_activo} / {asset.marca} / {asset.modelo}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Región:</span> {asset.region}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Fecha Registro:</span> {asset.fecha_registro ? new Date(asset.fecha_registro).toLocaleDateString('es-GT') : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Fin Garantía:</span> {asset.fecha_fin_garantia ? new Date(asset.fecha_fin_garantia).toLocaleDateString('es-GT') : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Solicitante:</span> {asset.solicitante}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Orden Compra:</span> {asset.orden_compra}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block max-h-96 overflow-y-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th
                      className="border border-gray-300 px-2 py-2 text-left cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('serie')}
                    >
                      Serie {modalSort === 'serie' && '↑'} {modalSort === '-serie' && '↓'}
                    </th>
                    <th
                      className="border border-gray-300 px-2 py-2 text-left cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('hostname')}
                    >
                      Hostname {modalSort === 'hostname' && '↑'} {modalSort === '-hostname' && '↓'}
                    </th>
                    <th
                      className="border border-gray-300 px-2 py-2 text-left cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('tipo_activo__name')}
                    >
                      Tipo {modalSort === 'tipo_activo__name' && '↑'} {modalSort === '-tipo_activo__name' && '↓'}
                    </th>
                    <th
                      className="border border-gray-300 px-2 py-2 text-left cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('marca__name')}
                    >
                      Marca {modalSort === 'marca__name' && '↑'} {modalSort === '-marca__name' && '↓'}
                    </th>
                    <th
                      className="border border-gray-300 px-2 py-2 text-left cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('modelo__name')}
                    >
                      Modelo {modalSort === 'modelo__name' && '↑'} {modalSort === '-modelo__name' && '↓'}
                    </th>
                    <th
                      className="border border-gray-300 px-2 py-2 text-left cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('region__name')}
                    >
                      Región {modalSort === 'region__name' && '↑'} {modalSort === '-region__name' && '↓'}
                    </th>
                    <th
                      className="border border-gray-300 px-2 py-2 text-left cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('fecha_registro')}
                    >
                      Fecha Registro {modalSort === 'fecha_registro' && '↑'} {modalSort === '-fecha_registro' && '↓'}
                    </th>
                    <th
                      className="border border-gray-300 px-2 py-2 text-left cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('fecha_fin_garantia')}
                    >
                      Fin Garantía {modalSort === 'fecha_fin_garantia' && '↑'} {modalSort === '-fecha_fin_garantia' && '↓'}
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Solicitante</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Orden Compra</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.assets.map((asset) => {
                    // Calculate warranty status for color coding
                    const getWarrantyStatus = (fechaFinGarantia) => {
                      if (!fechaFinGarantia) return 'no-warranty';

                      const warrantyDate = new Date(fechaFinGarantia);
                      const today = new Date();
                      const thirtyDaysFromNow = new Date();
                      thirtyDaysFromNow.setDate(today.getDate() + 30);

                      if (warrantyDate < today) return 'expired';
                      if (warrantyDate <= thirtyDaysFromNow) return 'expiring';
                      return 'valid';
                    };

                    const warrantyStatus = getWarrantyStatus(asset.fecha_fin_garantia);

                    return (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-2">{asset.serie}</td>
                        <td className="border border-gray-300 px-2 py-2">{asset.hostname}</td>
                        <td className="border border-gray-300 px-2 py-2">{asset.tipo_activo}</td>
                        <td className="border border-gray-300 px-2 py-2">{asset.marca}</td>
                        <td className="border border-gray-300 px-2 py-2">{asset.modelo}</td>
                        <td className="border border-gray-300 px-2 py-2">{asset.region}</td>
                        <td className="border border-gray-300 px-2 py-2">
                          {asset.fecha_registro ? new Date(asset.fecha_registro).toLocaleDateString('es-GT') : 'N/A'}
                        </td>
                        <td className={`border border-gray-300 px-2 py-2 ${
                          warrantyStatus === 'valid' ? 'bg-green-100' :
                          warrantyStatus === 'expiring' ? 'bg-yellow-100' :
                          warrantyStatus === 'expired' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {asset.fecha_fin_garantia ? new Date(asset.fecha_fin_garantia).toLocaleDateString('es-GT') : 'N/A'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2">{asset.solicitante}</td>
                        <td className="border border-gray-300 px-2 py-2">{asset.orden_compra}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination - Always show if there's pagination data */}
            {modalData.pagination && (
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="text-sm text-gray-700">
                  Mostrando {((modalData.pagination.page - 1) * modalData.pagination.page_size) + 1} a {Math.min(modalData.pagination.page * modalData.pagination.page_size, modalData.pagination.total_count)} de {modalData.pagination.total_count} registros
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(modalData.pagination.page - 1)}
                    disabled={modalData.pagination.page <= 1}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded"
                  >
                    Anterior
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, modalData.pagination.total_pages) }, (_, i) => {
                    const pageNum = Math.max(1, modalData.pagination.page - 2) + i;
                    if (pageNum > modalData.pagination.total_pages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded ${
                          pageNum === modalData.pagination.page
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(modalData.pagination.page + 1)}
                    disabled={modalData.pagination.page >= modalData.pagination.total_pages}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">No hay datos disponibles</div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Home;
