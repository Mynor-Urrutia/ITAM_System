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
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            {/* Page size selector */}
            {!hidePageSize && (
                <div className="flex items-center">
                    <label htmlFor="page-size" className="mr-2 text-sm text-gray-700">
                        Mostrar:
                    </label>
                    <select
                        id="page-size"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span className="ml-2 text-sm text-gray-700">registros por página</span>
                </div>
            )}

            {/* Pagination controls */}
            <div className="flex items-center space-x-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Anterior
                </button>

                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-3 py-1 text-sm text-gray-500">...</span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`px-3 py-1 text-sm font-medium border ${
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
                    className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Siguiente
                </button>
            </div>

            {/* Page info */}
            <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
            </div>
        </div>
    );
};

export default Pagination;