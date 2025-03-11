// src/components/DataPageLayout.js
import React from 'react';
import PageHeader from './PageHeader';
import SearchFilter from './SearchFilter';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import EmptyState from './EmptyState';
import TablePagination from './TablePagination';

const DataPageLayout = ({
  title,
  description,
  filters,
  onFilterChange,
  filterFields,
  loading,
  error,
  data,
  emptyTitle = "No results found",
  emptyMessage = "No results found matching the current filters.",
  renderData,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  showPagination = true,
  children
}) => {
  return (
    <div>
      <PageHeader
        title={title}
        description={!loading && !error && description}
      />

      {filterFields && onFilterChange && (
        <SearchFilter
          filters={filters}
          onFilterChange={onFilterChange}
          fields={filterFields}
          className="mb-6"
        />
      )}

      {loading ? (
        <LoadingSpinner size="md" centered={true} />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div>
          {data.length === 0 ? (
            <EmptyState
              title={emptyTitle}
              message={emptyMessage}
            />
          ) : (
            <>
              {/* Render the main content */}
              {renderData ? renderData(data) : children}

              {/* Pagination */}
              {showPagination && page !== undefined && rowsPerPage !== undefined && (
                <TablePagination
                  totalItems={data.length}
                  itemsPerPage={rowsPerPage}
                  currentPage={page}
                  onPageChange={onPageChange}
                  onRowsPerPageChange={onRowsPerPageChange}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DataPageLayout;
