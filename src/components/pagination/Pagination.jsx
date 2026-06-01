import './pagination.css';

const Pagination = ({ totalPages, currentPage, paginate }) => {
    if (totalPages <= 1) return null; // hide if only one page

    return (
        <nav className="page-container" aria-label="Product pages">
            <button
                className="pagination-btn pagination-arrow"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                &lsaquo;
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                return (
                    <button
                        key={page}
                        className={`pagination-btn${currentPage === page ? ' active' : ''}`}
                        onClick={() => paginate(page)}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                className="pagination-btn pagination-arrow"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                &rsaquo;
            </button>
        </nav>
    );
};

export default Pagination;
