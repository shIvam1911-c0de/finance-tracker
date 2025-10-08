import { useCallback } from 'react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = useCallback(() => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  }, [currentPage, totalPages, onPageChange]);

  const handlePageClick = useCallback((page) => {
    onPageChange(page);
  }, [onPageChange]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Previous
      </button>
      
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => handlePageClick(i + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === i + 1 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {i + 1}
        </button>
      ))}
      
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        Next
      </button>
    </div>
  );
};