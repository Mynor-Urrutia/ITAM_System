/**
 * Componente de paginación reutilizable para el sistema ITAM.
 *
 * Proporciona navegación entre páginas con diferentes estrategias de visualización:
 * - Páginas consecutivas para pocos resultados
 * - Páginas con ellipsis (...) para muchos resultados
 * - Selector de tamaño de página configurable
 * - Diseño responsive para móvil y desktop
 * - Navegación inteligente con límites de páginas visibles
 *
 * Características principales:
 * - Algoritmo inteligente de visualización de páginas
 * - Soporte para ellipsis en rangos grandes
 * - Selector dinámico de elementos por página
 * - Navegación responsive (botones de texto en desktop, símbolos en móvil)
 * - Estados de página actual destacados visualmente
 * - Información de página actual y total
 */

import React from 'react';

/**
 * Componente de paginación con navegación inteligente.
 *
 * @param {number} currentPage - Página actual
 * @param {number} totalPages - Total de páginas disponibles
 * @param {number} pageSize - Número de elementos por página
 * @param {number[]} pageSizeOptions - Opciones disponibles para tamaño de página
 * @param {function} onPageChange - Función para cambiar de página
 * @param {function} onPageSizeChange - Función para cambiar tamaño de página
 * @param {boolean} hidePageSize - Si debe ocultar el selector de tamaño de página
 */
const Pagination = ({ currentPage, totalPages, pageSize, pageSizeOptions, onPageChange, onPageSizeChange, hidePageSize = false }) => {
    /**
     * Calcula qué números de página mostrar en la navegación.
     * Usa ellipsis (...) para evitar mostrar demasiados números.
     */
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5; // Máximo de páginas visibles a la vez

        // Si hay pocas páginas, mostrar todas
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Lógica para mostrar páginas con ellipsis
            if (currentPage <= 3) {
                // Principio: mostrar primeras 4 páginas + ... + última
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Final: mostrar primera + ... + últimas 4 páginas
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Medio: mostrar primera + ... + páginas alrededor de la actual + ... + última
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-2 sm:px-4 sm:py-3 bg-white border-t border-gray-200 sm:px-6 space-y-2 sm:space-y-0">
            {/* Page size selector */}
            {!hidePageSize && (
                <div className="flex items-center text-xs sm:text-sm">
                    <label htmlFor="page-size" className="mr-1 sm:mr-2 text-gray-700">
                        Mostrar:
                    </label>
                    <select
                        id="page-size"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                        className="px-1 py-1 sm:px-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span className="ml-1 sm:ml-2 text-gray-700">por página</span>
                </div>
            )}

            {/* Pagination controls */}
            <div className="flex items-center space-x-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 sm:px-3 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="hidden sm:inline">Anterior</span>
                    <span className="sm:hidden">◀</span>
                </button>

                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-2 py-1 sm:px-3 text-xs sm:text-sm text-gray-500">...</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`px-2 py-1 sm:px-3 text-xs sm:text-sm font-medium border ${
                                    page === currentPage
                                        ? 'text-blue-600 bg-blue-50 border-blue-500'
                                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 sm:px-3 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="hidden sm:inline">Siguiente</span>
                    <span className="sm:hidden">▶</span>
                </button>
            </div>

            {/* Page info */}
            <div className="text-xs sm:text-sm text-gray-700">
                {currentPage} de {totalPages}
            </div>
        </div>
    );
};

export default Pagination;