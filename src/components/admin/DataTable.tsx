import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  render: (row: T) => ReactNode
}

export interface DataTableFilterOption {
  value: string
  label: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  loading: boolean
  rowKey: (row: T) => string | number
  emptyMessage?: string
  rowClassName?: (row: T) => string | undefined
  onRowClick?: (row: T) => void

  search?: {
    value: string
    onChange: (value: string) => void
    onSubmit?: () => void
    placeholder?: string
  }
  filters?: {
    value: string
    options: DataTableFilterOption[]
    onChange: (value: string) => void
  }
  sort?: {
    key: string
    direction: 'asc' | 'desc'
    onChange: (key: string) => void
  }
  pagination?: {
    page: number
    total: number
    limit: number
    onPageChange: (page: number) => void
  }
}

export default function DataTable<T>({
  columns,
  rows,
  loading,
  rowKey,
  emptyMessage = 'No results found.',
  rowClassName,
  onRowClick,
  search,
  filters,
  sort,
  pagination,
}: DataTableProps<T>) {
  const hasToolbar = Boolean(search || filters)

  return (
    <>
      {hasToolbar && (
        <div className="admin-toolbar">
          {search && (
            <form
              className="admin-search"
              onSubmit={(e) => {
                e.preventDefault()
                search.onSubmit?.()
              }}
            >
              <input
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder ?? 'Search'}
              />
              <button type="submit">Search</button>
            </form>
          )}
          {filters && (
            <div className="admin-pill-group">
              {filters.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => filters.onChange(opt.value)}
                  className={filters.value === opt.value ? 'active' : ''}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key
                return (
                  <th
                    key={col.key}
                    className={col.sortable ? 'sortable' : undefined}
                    onClick={col.sortable && sort ? () => sort.onChange(col.key) : undefined}
                  >
                    {col.header}
                    {col.sortable && (
                      <span className="sort-arrow">{isSorted ? (sort!.direction === 'asc' ? ' ▲' : ' ▼') : ''}</span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length}>Loading…</td>
              </tr>
            )}
            {!loading && !rows.length && (
              <tr>
                <td colSpan={columns.length}>{emptyMessage}</td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={rowClassName?.(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key}>{col.render(row)}</td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="admin-pagination">
          <button
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            ← Prev
          </button>
          <span>
            Page {pagination.page} / {Math.ceil(pagination.total / pagination.limit) || 1}
          </span>
          <button
            disabled={pagination.page * pagination.limit >= pagination.total}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </>
  )
}
