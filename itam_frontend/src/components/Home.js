// src/components/Home.js
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getDashboardData, getDashboardModelsData, getDashboardSummary, getDashboardDetailData } from '../api';

ChartJS.register(ArcElement, Tooltip, Legend);

function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [modelsData, setModelsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [modalSort, setModalSort] = useState('serie');
  const [modalPage, setModalPage] = useState(1);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data individually to better handle errors
        const dashboardResponse = await getDashboardData();
        setDashboardData(dashboardResponse.data);

        const modelsResponse = await getDashboardModelsData();
        setModelsData(modelsResponse.data);


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
    <div className="min-h-full p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard ITAM</h1>

      {/* Summary Cards */}
      {summaryData && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {/* Total Assets Card */}
          <div
            className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick('total_assets', 'Total de Activos')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">∑</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Activos</p>
                <p className="text-2xl font-bold text-gray-900">{summaryData.total_assets || 0}</p>
              </div>
            </div>
          </div>

          {/* Asset Type Cards */}
          {summaryData.asset_types && summaryData.asset_types.map((assetType, index) => {
            const colors = ['purple', 'green', 'yellow', 'red', 'indigo', 'pink', 'gray'];
            const color = colors[index % colors.length];

            return (
              <div
                key={assetType.tipo_activo}
                className={`bg-white rounded-lg shadow-md p-4 border-l-4 border-${color}-500 cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => handleCardClick(assetType.tipo_activo, assetType.tipo_activo)}
              >
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">{assetType.tipo_activo}</h3>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">{assetType.total_equipment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Garantía Vigente:</span>
                    <span className="font-semibold text-green-600">{assetType.valid_warranty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Próxima (30d):</span>
                    <span className="font-semibold text-yellow-600">{assetType.expiring_warranty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Sin Garantía:</span>
                    <span className="font-semibold text-red-600">{assetType.no_warranty}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sección 1: Tabla de tipos de activos por región */}
        <div className="bg-white rounded-lg shadow-md p-6 flex-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribución de Activos por Tipo y Región</h2>
          {dashboardData && dashboardData.tipos_activo.length > 0 ? (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left">Tipo de Activo</th>
                    {dashboardData.regions.map(region => (
                      <th key={region} className="border border-gray-300 px-2 py-1 text-center">{region}</th>
                    ))}
                    <th className="border border-gray-300 px-2 py-1 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.tipos_activo.map((tipo, index) => (
                    <tr key={tipo.name} className={index === dashboardData.tipos_activo.length - 1 ? 'bg-gray-200 font-bold' : 'hover:bg-gray-50'}>
                      <td className="border border-gray-300 px-2 py-1">{tipo.name}</td>
                      {dashboardData.regions.map(region => (
                        <td key={region} className="border border-gray-300 px-2 py-1 text-center">{tipo.counts[region] || 0}</td>
                      ))}
                      <td className="border border-gray-300 px-2 py-1 text-center">{tipo.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>

        {/* Sección 2: Tabla de modelos de activos por región */}
        <div className="bg-white rounded-lg shadow-md p-6 flex-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribución de Equipos por Modelo y Región</h2>
          {modelsData && modelsData.modelos_activo.length > 0 ? (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left">Modelo de Activo</th>
                    {modelsData.regions.map(region => (
                      <th key={region} className="border border-gray-300 px-2 py-1 text-center">{region}</th>
                    ))}
                    <th className="border border-gray-300 px-2 py-1 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {modelsData.modelos_activo.map((modelo, index) => (
                    <tr key={modelo.name} className={index === modelsData.modelos_activo.length - 1 ? 'bg-gray-200 font-bold' : 'hover:bg-gray-50'}>
                      <td className="border border-gray-300 px-2 py-1">{modelo.name}</td>
                      {modelsData.regions.map(region => (
                        <td key={region} className="border border-gray-300 px-2 py-1 text-center">{modelo.counts[region] || 0}</td>
                      ))}
                      <td className="border border-gray-300 px-2 py-1 text-center">{modelo.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No hay datos disponibles</p>
          )}
        </div>

        {/* Sección 3: Gráfica de pastel - Distribución de Tipos de Equipo */}
        <div className="bg-white rounded-lg shadow-md p-6 flex-1">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribución de Tipos de Equipo</h2>
          {summaryData && summaryData.asset_types && summaryData.asset_types.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md">
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
                              padding: 20,
                              usePointStyle: true,
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
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Total de equipos: <span className="font-semibold">{summaryData.total_assets}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No hay datos disponibles para la gráfica</p>
            </div>
          )}
        </div>
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
                  <span>Vigente (>30 días)</span>
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

            <div className="max-h-96 overflow-y-auto">
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
