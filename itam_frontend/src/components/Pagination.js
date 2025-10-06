import React from 'react';

const Pagination = ({ currentPage, totalPages, pageSize, pageSizeOptions, onPageChange, onPageSizeChange, hidePageSize = false }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
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