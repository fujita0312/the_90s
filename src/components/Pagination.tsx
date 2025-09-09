import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-2 border-cyan-400/30 rounded-none">
      {/* Items Info */}
      <div className="text-sm text-cyan-400 font-bold text-center lg:text-left">
        Showing {startItem}-{endItem} of {totalItems} memes
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-300 border-2 rounded-none ${
            currentPage === 1
              ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400/20 to-pink-400/20 border-cyan-400 text-cyan-400 hover:border-pink-400 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:scale-105 transform'
          }`}
        >
          <span className="hidden sm:inline">⏮️ First</span>
          <span className="sm:hidden">⏮️</span>
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-300 border-2 rounded-none ${
            currentPage === 1
              ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400/20 to-pink-400/20 border-cyan-400 text-cyan-400 hover:border-pink-400 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:scale-105 transform'
          }`}
        >
          <span className="hidden sm:inline">⬅️ Prev</span>
          <span className="sm:hidden">⬅️</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-2 text-cyan-400 font-bold text-xs sm:text-sm">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-300 border-2 rounded-none ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 border-yellow-400 text-yellow-400 shadow-[0_0_20px_rgba(255,255,0,0.6)] scale-105'
                      : 'bg-gradient-to-r from-cyan-400/20 to-pink-400/20 border-cyan-400 text-cyan-400 hover:border-pink-400 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:scale-105 transform'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-300 border-2 rounded-none ${
            currentPage === totalPages
              ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400/20 to-pink-400/20 border-cyan-400 text-cyan-400 hover:border-pink-400 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:scale-105 transform'
          }`}
        >
          <span className="hidden sm:inline">Next ➡️</span>
          <span className="sm:hidden">➡️</span>
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-300 border-2 rounded-none ${
            currentPage === totalPages
              ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400/20 to-pink-400/20 border-cyan-400 text-cyan-400 hover:border-pink-400 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:scale-105 transform'
          }`}
        >
          <span className="hidden sm:inline">Last ⏭️</span>
          <span className="sm:hidden">⏭️</span>
        </button>
      </div>

      {/* Page Size Selector */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-400">
        <span className="hidden sm:inline">Per page:</span>
        <span className="sm:hidden">Per:</span>
        <select
          onChange={(e) => {
            const newPageSize = parseInt(e.target.value);
            if (onItemsPerPageChange) {
              onItemsPerPageChange(newPageSize);
            }
            const newTotalPages = Math.ceil(totalItems / newPageSize);
            const newCurrentPage = Math.min(currentPage, newTotalPages);
            onPageChange(newCurrentPage);
          }}
          className="bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-cyan-400 text-cyan-400 px-2 py-1 font-bold focus:border-pink-400 focus:outline-none focus:shadow-[0_0_10px_rgba(0,255,255,0.3)] transition-all duration-300 rounded-none"
          value={itemsPerPage}
        >
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
          <option value={96}>96</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;
