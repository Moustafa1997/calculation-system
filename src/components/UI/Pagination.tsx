import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // If there are 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Show dots if current page is > 3
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Show dots if current page is < totalPages - 2
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <nav className="pagination">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`pagination-item ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        السابق
      </button>
      
      {/* Page numbers */}
      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {typeof page === 'number' ? (
            <button
              onClick={() => onPageChange(page)}
              className={`pagination-item ${page === currentPage ? 'active' : ''}`}
            >
              {page}
            </button>
          ) : (
            <span className="px-2 py-1 text-gray-500">...</span>
          )}
        </React.Fragment>
      ))}
      
      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`pagination-item ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        التالي
      </button>
    </nav>
  );
};

export default Pagination;