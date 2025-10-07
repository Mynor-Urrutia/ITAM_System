// src/components/Home.js
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Pagination from './Pagination';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { getDashboardData, getDashboardModelsData, getDashboardSummary, getDashboardDetailData, getDashboardWarrantyData, getMaintenanceOverview, getActivos } from '../api';
import api from '../api';
import ActivoDetailModal from '../pages/assets/ActivoDetailModal';

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
  const [selectedWarrantyRegions, setSelectedWarrantyRegions] = useState([]);
  const [warrantyFiltersOpen, setWarrantyFiltersOpen] = useState(false);
  const [expandedWarrantyCards, setExpandedWarrantyCards] = useState({});
  const [warrantyPage, setWarrantyPage] = useState(1);
  const [warrantyPageSize, setWarrantyPageSize] = useState(5);

  // Maintenance filter state
  const [selectedMaintenanceTypes, setSelectedMaintenanceTypes] = useState([]);
  const [selectedMaintenanceRegions, setSelectedMaintenanceRegions] = useState([]);
  const [selectedMaintenanceStatuses, setSelectedMaintenanceStatuses] = useState([]);

  // Maintenance table sorting and pagination state
  const [maintenanceSortField, setMaintenanceSortField] = useState('hostname');
  const [maintenanceSortDirection, setMaintenanceSortDirection] = useState('asc');
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceFilterOptions, setMaintenanceFilterOptions] = useState({ tipos: [] });
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [maintenancePageSize, setMaintenancePageSize] = useState(5);
  const [maintenanceFiltersOpen, setMaintenanceFiltersOpen] = useState(false);
  const [expandedMaintenanceCards, setExpandedMaintenanceCards] = useState({});

  // Asset detail modal state
  const [showAssetDetailModal, setShowAssetDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetDetailLoading, setAssetDetailLoading] = useState(false);

  // Separate function to fetch maintenance data
  const fetchMaintenanceData = async () => {
    try {
      setMaintenanceLoading(true);
      const params = {
        page_size: 1000, // Fetch all data
        ordering: maintenanceSortDirection === 'desc' ? `-${maintenanceSortField}` : maintenanceSortField,
      };

      const maintenanceResponse = await getMaintenanceOverview(params);
      const maintenanceDataResults = maintenanceResponse.data.results || maintenanceResponse.data;
      setMaintenanceData(maintenanceDataResults);
      setMaintenanceFilterOptions(maintenanceResponse.data.filter_options || { tipos: [] });
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
    } finally {
      setMaintenanceLoading(false);
    }
  };

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

  // Separate useEffect for maintenance data
  useEffect(() => {
    fetchMaintenanceData();
  }, [maintenanceSortField, maintenanceSortDirection]);

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && summaryData && summaryData.asset_types && summaryData.asset_types.length > 1) {
      const interval = setInterval(() => {
        setCurrentCardIndex((prevIndex) => {
          const cardsPerView = window.innerWidth < 640 ? 1 : 3;
          const maxIndex = Math.max(0, summaryData.asset_types.length - cardsPerView);
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

  // Maintenance table sorting and pagination handlers
  const handleMaintenanceSort = (field) => {
    if (maintenanceSortField === field) {
      // Toggle direction if same field
      setMaintenanceSortDirection(maintenanceSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setMaintenanceSortField(field);
      setMaintenanceSortDirection('asc');
    }
    setMaintenancePage(1); // Reset to first page when sorting
  };

  const handleMaintenancePageChange = (page) => {
    setMaintenancePage(page);
  };

  const handleMaintenancePageSizeChange = (size) => {
    setMaintenancePageSize(size);
    setMaintenancePage(1);
  };

  // Warranty pagination handlers
  const handleWarrantyPageChange = (page) => {
    setWarrantyPage(page);
  };

  const handleWarrantyPageSizeChange = (size) => {
    setWarrantyPageSize(size);
    setWarrantyPage(1);
  };

  // Asset detail modal handlers
  const handleAssetClick = async (hostname) => {
    try {
      setAssetDetailLoading(true);
      setShowAssetDetailModal(true);

      // Find the asset by hostname from maintenance data
      const assetFromMaintenance = maintenanceData.find(item => item.hostname === hostname);

      if (assetFromMaintenance && assetFromMaintenance.id) {
        // Fetch full asset details using direct ID endpoint
        const response = await api.get(`assets/activos/${assetFromMaintenance.id}/`);
        if (response.data) {
          setSelectedAsset(response.data);
        }
      } else {
        setShowAssetDetailModal(false);
      }
    } catch (error) {
      console.error('Error fetching asset details:', error);
      setShowAssetDetailModal(false);
    } finally {
      setAssetDetailLoading(false);
    }
  };

  const closeAssetDetailModal = () => {
    setShowAssetDetailModal(false);
    setSelectedAsset(null);
  };

  const getMaintenanceSortIcon = (field) => {
    if (maintenanceSortField !== field) {
      return faSort;
    }
    return maintenanceSortDirection === 'asc' ? faSortUp : faSortDown;
  };


  // Carousel functions
  const nextCard = () => {
    if (summaryData && summaryData.asset_types) {
      const cardsPerView = window.innerWidth < 640 ? 1 : 3;
      const maxIndex = Math.max(0, summaryData.asset_types.length - cardsPerView);
      setCurrentCardIndex((prevIndex) =>
        prevIndex >= maxIndex ? 0 : prevIndex + 1
      );
    }
  };

  const prevCard = () => {
    if (summaryData && summaryData.asset_types) {
      const cardsPerView = window.innerWidth < 640 ? 1 : 3;
      const maxIndex = Math.max(0, summaryData.asset_types.length - cardsPerView);
      setCurrentCardIndex((prevIndex) =>
        prevIndex <= 0 ? maxIndex : prevIndex - 1
      );
    }
  };

  const goToCard = (index) => {
    if (summaryData && summaryData.asset_types) {
      const cardsPerView = window.innerWidth < 640 ? 1 : 3;
      const maxIndex = Math.max(0, summaryData.asset_types.length - cardsPerView);
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
                {/* Cards Container - Show 1 card on mobile, 3 on desktop */}
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${(currentCardIndex * 100) / (window.innerWidth < 640 ? 1 : 3)}%)` }}
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
                        <div key={assetType.tipo_activo} className="w-full sm:w-1/3 flex-shrink-0 px-2">
                          <div
                            className={`bg-gradient-to-r ${color} rounded-lg p-3 text-white cursor-pointer hover:shadow-lg transition-shadow`}
                            onClick={() => handleCardClick(assetType.tipo_activo, assetType.tipo_activo)}
                          >
                            <div className="mb-2">
                              <h3 className="text-sm sm:text-base font-semibold">{assetType.tipo_activo}</h3>
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
                {summaryData.asset_types.length > (window.innerWidth < 640 ? 1 : 3) && (
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
                {summaryData.asset_types.length > (window.innerWidth < 640 ? 1 : 3) && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: Math.max(1, summaryData.asset_types.length - (window.innerWidth < 640 ? 0 : 2)) }, (_, index) => (
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
            <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
              <button
                onClick={() => setWarrantyFiltersOpen(!warrantyFiltersOpen)}
                className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Filtros de Garantías</span>
                <FontAwesomeIcon
                  icon={warrantyFiltersOpen ? faChevronUp : faChevronDown}
                  className="text-gray-500 transition-transform"
                />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${
                warrantyFiltersOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="p-3 space-y-4 border-t border-gray-200">
                  <div>
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
                                setWarrantyPage(1);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{type}</span>
                          </label>
                        ));
                      })()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filtrar por Región:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        // Get unique regions from warranty data
                        const uniqueRegions = [...new Set(warrantyData.warranty_assets.map(asset => asset.region))].filter(Boolean);
                        return uniqueRegions.map(region => (
                          <label key={region} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedWarrantyRegions.includes(region)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWarrantyRegions([...selectedWarrantyRegions, region]);
                                } else {
                                  setSelectedWarrantyRegions(selectedWarrantyRegions.filter(r => r !== region));
                                }
                                setWarrantyPage(1);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{region}</span>
                          </label>
                        ));
                      })()}
                    </div>
                  </div>

                  {(selectedWarrantyTypes.length > 0 || selectedWarrantyRegions.length > 0) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedWarrantyTypes([]);
                          setSelectedWarrantyRegions([]);
                          setWarrantyPage(1);
                        }}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        Limpiar todos los filtros
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {warrantyData && warrantyData.warranty_assets && warrantyData.warranty_assets.length > 0 ? (() => {
            // Filter assets based on selected types and regions
            let filteredAssets = warrantyData.warranty_assets;
            if (selectedWarrantyTypes.length > 0) {
              filteredAssets = filteredAssets.filter(asset => selectedWarrantyTypes.includes(asset.tipo_activo));
            }
            if (selectedWarrantyRegions.length > 0) {
              filteredAssets = filteredAssets.filter(asset => selectedWarrantyRegions.includes(asset.region));
            }

            // Calculate pagination
            const totalCount = filteredAssets.length;
            const totalPages = Math.ceil(totalCount / warrantyPageSize);
            const startIndex = (warrantyPage - 1) * warrantyPageSize;
            const endIndex = startIndex + warrantyPageSize;
            const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

            return (
              <>
                {/* Mobile Card View */}
                <div className="block sm:hidden max-h-96 overflow-y-auto space-y-4">
                  {paginatedAssets.map((asset, index) => {
                    // Calculate warranty status for color coding
                    const warrantyDate = new Date(asset.fecha_vencimiento_garantia);
                    const today = new Date();
                    const daysLeft = Math.ceil((warrantyDate - today) / (1000 * 60 * 60 * 24));

                    let statusColor = 'bg-red-100 text-red-800'; // Expired
                    let statusText = 'Vencida';

                    if (daysLeft > 0) {
                      if (daysLeft <= 30) {
                        statusColor = 'bg-yellow-100 text-yellow-800'; // Expiring soon
                        statusText = `Vence en ${daysLeft} días`;
                      } else {
                        statusColor = 'bg-green-100 text-green-800'; // Valid
                        statusText = 'Vigente';
                      }
                    }

                    const isExpanded = expandedWarrantyCards[asset.id] || false;

                    return (
                      <div key={asset.id} className="bg-white p-4 rounded-lg shadow border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{asset.hostname}</h3>
                            <p className="text-sm text-gray-600">{asset.serie}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>

                        <button
                          onClick={() => setExpandedWarrantyCards(prev => ({
                            ...prev,
                            [asset.id]: !prev[asset.id]
                          }))}
                          className="w-full text-left mt-2 p-2 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-between transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-700">Ver más info</span>
                          <FontAwesomeIcon
                            icon={isExpanded ? faChevronUp : faChevronDown}
                            className="text-gray-500 transition-transform"
                          />
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ${
                          isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="space-y-2 text-sm border-t border-gray-200 pt-2">
                            <div className="grid grid-cols-1 gap-1">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Tipo:</span>
                                <span className="text-gray-900">{asset.tipo_activo}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Marca:</span>
                                <span className="text-gray-900">{asset.marca}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Modelo:</span>
                                <span className="text-gray-900">{asset.modelo}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                              <span className="text-gray-600 font-medium">Región:</span>
                              <span className="text-gray-900">{asset.region}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">Fecha Vencimiento:</span>
                              <span className="text-gray-900 font-semibold">{new Date(asset.fecha_vencimiento_garantia).toLocaleDateString('es-GT')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto max-h-64 overflow-y-auto">
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
                      {paginatedAssets.slice(0, 10).map((asset, index) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination for Warranty Table */}
                {totalCount > 0 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={warrantyPage}
                      totalPages={totalPages}
                      pageSize={warrantyPageSize}
                      pageSizeOptions={[5, 10, 20, 50]}
                      onPageChange={handleWarrantyPageChange}
                      onPageSizeChange={handleWarrantyPageSizeChange}
                    />
                  </div>
                )}
              </>
            );
          })() : (
            <p className="text-gray-500 text-center py-8">No hay garantías próximas a vencer</p>
          )}
        </div>

        {/* Upcoming Maintenance Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Mantenimientos Próximos</h2>


          {/* Filter Controls */}
          {(maintenanceFilterOptions.tipos && maintenanceFilterOptions.tipos.length > 0) ||
          (maintenanceFilterOptions.regions && maintenanceFilterOptions.regions.length > 0) ? (
            <div className="mb-4 bg-gray-50 rounded-lg overflow-hidden">
              <button
                onClick={() => setMaintenanceFiltersOpen(!maintenanceFiltersOpen)}
                className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Filtros de Mantenimiento</span>
                <FontAwesomeIcon
                  icon={maintenanceFiltersOpen ? faChevronUp : faChevronDown}
                  className="text-gray-500 transition-transform"
                />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${
                maintenanceFiltersOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="p-3 space-y-4 border-t border-gray-200">
                  {maintenanceFilterOptions.tipos && maintenanceFilterOptions.tipos.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filtrar por Tipo de Activo:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {maintenanceFilterOptions.tipos.map(tipo => (
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
                                setMaintenancePage(1);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{tipo}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {maintenanceFilterOptions.regions && maintenanceFilterOptions.regions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filtrar por Región:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {maintenanceFilterOptions.regions.map(region => (
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
                                setMaintenancePage(1);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{region}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {maintenanceFilterOptions.statuses && maintenanceFilterOptions.statuses.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filtrar por Estado:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {maintenanceFilterOptions.statuses.map(status => {
                          const statusLabels = {
                            'nunca': 'Nunca',
                            'proximos': 'Próximos',
                            'vencidos': 'Vencidos',
                            'realizados': 'Realizados'
                          };
                          return (
                            <label key={status} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedMaintenanceStatuses.includes(status)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMaintenanceStatuses([...selectedMaintenanceStatuses, status]);
                                  } else {
                                    setSelectedMaintenanceStatuses(selectedMaintenanceStatuses.filter(s => s !== status));
                                  }
                                  setMaintenancePage(1);
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{statusLabels[status] || status}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(selectedMaintenanceTypes.length > 0 || selectedMaintenanceRegions.length > 0 || selectedMaintenanceStatuses.length > 0) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedMaintenanceTypes([]);
                          setSelectedMaintenanceRegions([]);
                          setSelectedMaintenanceStatuses([]);
                          setMaintenancePage(1);
                        }}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        Limpiar todos los filtros
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Table Content */}
          <div>
            {maintenanceLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Cargando datos de mantenimiento...</div>
              </div>
            ) : maintenanceData && Array.isArray(maintenanceData) && maintenanceData.length > 0 ? (
              (() => {
                // Filter data based on selected types, regions, and statuses
                let filteredData = maintenanceData;
                if (selectedMaintenanceTypes.length > 0) {
                  filteredData = filteredData.filter(item => selectedMaintenanceTypes.includes(item.tipo));
                }
                if (selectedMaintenanceRegions.length > 0) {
                  filteredData = filteredData.filter(item => selectedMaintenanceRegions.includes(item.region));
                }
                if (selectedMaintenanceStatuses.length > 0) {
                  filteredData = filteredData.filter(item => selectedMaintenanceStatuses.includes(item.status));
                }

                // Calculate pagination
                const totalCount = filteredData.length;
                const totalPages = Math.ceil(totalCount / maintenancePageSize);
                const startIndex = (maintenancePage - 1) * maintenancePageSize;
                const endIndex = startIndex + maintenancePageSize;
                const paginatedData = filteredData.slice(startIndex, endIndex);

                return (
                  <>
                    {/* Mobile Card View */}
                    <div className="block sm:hidden max-h-96 overflow-y-auto space-y-4">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => {
                          const isExpanded = expandedMaintenanceCards[item.id] || false;

                          return (
                            <div key={item.id} className="bg-white p-4 rounded-lg shadow border">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div
                                    className="font-bold text-lg text-blue-600 cursor-pointer hover:text-blue-800 hover:underline"
                                    onClick={() => handleAssetClick(item.hostname)}
                                  >
                                    {item.hostname}
                                  </div>
                                  <p className="text-sm text-gray-600">{item.serie}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'nunca' ? 'bg-gray-100 text-gray-800' :
                                  item.status === 'proximos' ? 'bg-yellow-100 text-yellow-800' :
                                  item.status === 'vencidos' ? 'bg-red-100 text-red-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {item.status === 'nunca' ? 'Nunca' :
                                   item.status === 'proximos' ? 'Próximos' :
                                   item.status === 'vencidos' ? 'Vencidos' :
                                   'Realizado'}
                                </span>
                              </div>

                              <button
                                onClick={() => setExpandedMaintenanceCards(prev => ({
                                  ...prev,
                                  [item.id]: !prev[item.id]
                                }))}
                                className="w-full text-left mt-2 p-2 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-between transition-colors"
                              >
                                <span className="text-sm font-medium text-gray-700">Ver más info</span>
                                <FontAwesomeIcon
                                  icon={isExpanded ? faChevronUp : faChevronDown}
                                  className="text-gray-500 transition-transform"
                                />
                              </button>

                              <div className={`overflow-hidden transition-all duration-300 ${
                                isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                              }`}>
                                <div className="space-y-1 text-sm border-t border-gray-200 pt-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Tipo/Modelo:</span>
                                    <span className="text-gray-900">{item.tipo} / {item.modelo}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Último Mantenimiento:</span>
                                    <span className="text-gray-900">
                                      {item.ultimo_mantenimiento ?
                                        new Date(item.ultimo_mantenimiento).toLocaleDateString('es-GT') :
                                        'Nunca'
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Próximo Mantenimiento:</span>
                                    <span className="text-gray-900">
                                      {item.proximo_mantenimiento ?
                                        new Date(item.proximo_mantenimiento).toLocaleDateString('es-GT') :
                                        'No programado'
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Región/Finca:</span>
                                    <span className="text-gray-900">{item.region} / {item.finca}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Técnico:</span>
                                    <span className="text-gray-900">{item.tecnico_mantenimiento || item.usuario || 'No asignado'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No hay activos que coincidan con los filtros seleccionados
                        </div>
                      )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
                        <thead className="sticky top-0 bg-gray-100">
                          <tr>
                            <th
                              className="border border-gray-300 px-2 py-1 text-left cursor-pointer hover:bg-gray-200 select-none"
                              onClick={() => handleMaintenanceSort('hostname')}
                            >
                              <div className="flex items-center">
                                Activo
                                <FontAwesomeIcon icon={getMaintenanceSortIcon('hostname')} className="ml-1 text-xs" />
                              </div>
                            </th>
                            <th
                              className="border border-gray-300 px-2 py-1 text-left cursor-pointer hover:bg-gray-200 select-none"
                              onClick={() => handleMaintenanceSort('tipo')}
                            >
                              <div className="flex items-center">
                                Tipo
                                <FontAwesomeIcon icon={getMaintenanceSortIcon('tipo')} className="ml-1 text-xs" />
                              </div>
                            </th>
                            <th
                              className="border border-gray-300 px-2 py-1 text-left cursor-pointer hover:bg-gray-200 select-none"
                              onClick={() => handleMaintenanceSort('modelo')}
                            >
                              <div className="flex items-center">
                                Modelo
                                <FontAwesomeIcon icon={getMaintenanceSortIcon('modelo')} className="ml-1 text-xs" />
                              </div>
                            </th>
                            <th
                              className="border border-gray-300 px-2 py-1 text-left cursor-pointer hover:bg-gray-200 select-none"
                              onClick={() => handleMaintenanceSort('ultimo_mantenimiento')}
                            >
                              <div className="flex items-center">
                                Ultimo Matto
                                <FontAwesomeIcon icon={getMaintenanceSortIcon('ultimo_mantenimiento')} className="ml-1 text-xs" />
                              </div>
                            </th>
                            <th
                              className="border border-gray-300 px-2 py-1 text-left cursor-pointer hover:bg-gray-200 select-none"
                              onClick={() => handleMaintenanceSort('proximo_mantenimiento')}
                            >
                              <div className="flex items-center">
                                Proximo Mantto
                                <FontAwesomeIcon icon={getMaintenanceSortIcon('proximo_mantenimiento')} className="ml-1 text-xs" />
                              </div>
                            </th>
                            <th
                              className="border border-gray-300 px-2 py-1 text-left cursor-pointer hover:bg-gray-200 select-none"
                              onClick={() => handleMaintenanceSort('region')}
                            >
                              <div className="flex items-center">
                                Región
                                <FontAwesomeIcon icon={getMaintenanceSortIcon('region')} className="ml-1 text-xs" />
                              </div>
                            </th>
                            <th
                              className="border border-gray-300 px-2 py-1 text-left cursor-pointer hover:bg-gray-200 select-none"
                              onClick={() => handleMaintenanceSort('finca')}
                            >
                              <div className="flex items-center">
                                Finca
                                <FontAwesomeIcon icon={getMaintenanceSortIcon('finca')} className="ml-1 text-xs" />
                              </div>
                            </th>
                            <th
                              className="border border-gray-300 px-2 py-1 text-left cursor-pointer hover:bg-gray-200 select-none"
                              onClick={() => handleMaintenanceSort('tecnico_mantenimiento')}
                            >
                              <div className="flex items-center">
                                Técnico
                                <FontAwesomeIcon icon={getMaintenanceSortIcon('tecnico_mantenimiento')} className="ml-1 text-xs" />
                              </div>
                            </th>
                            <th
                              className="border border-gray-300 px-2 py-1 text-left cursor-pointer hover:bg-gray-200 select-none"
                              onClick={() => handleMaintenanceSort('status')}
                            >
                              <div className="flex items-center">
                                Estado
                                <FontAwesomeIcon icon={getMaintenanceSortIcon('status')} className="ml-1 text-xs" />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-2 py-1">
                                  <div>
                                    <div
                                      className="font-medium cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
                                      onClick={() => handleAssetClick(item.hostname)}
                                    >
                                      {item.hostname}
                                    </div>
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
                                    item.status === 'nunca' ? 'bg-gray-100 text-gray-800' :
                                    item.status === 'proximos' ? 'bg-yellow-100 text-yellow-800' :
                                    item.status === 'vencidos' ? 'bg-red-100 text-red-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {item.status === 'nunca' ? 'Nunca' :
                                     item.status === 'proximos' ? 'Próximos' :
                                     item.status === 'vencidos' ? 'Vencidos' :
                                     'Realizado'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="9" className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                                No hay activos que coincidan con los filtros seleccionados
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination for Maintenance Table */}
                    {totalCount > 0 && (
                      <div className="mt-4">
                        <Pagination
                          currentPage={maintenancePage}
                          totalPages={totalPages}
                          pageSize={maintenancePageSize}
                          pageSizeOptions={[5, 10, 20, 50]}
                          onPageChange={handleMaintenancePageChange}
                          onPageSizeChange={handleMaintenancePageSizeChange}
                        />
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <p className="text-gray-500 text-center py-8">
                No hay datos de mantenimiento disponibles
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

      {/* Asset Detail Modal */}
      <ActivoDetailModal
        show={showAssetDetailModal}
        onClose={closeAssetDetailModal}
        activo={selectedAsset}
        onActivoUpdate={() => {
          // Refresh maintenance data if asset was updated
          fetchMaintenanceData();
        }}
      />
    </div>
  );
}

export default Home;
