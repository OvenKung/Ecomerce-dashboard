import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/60",
      className
    )} 
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-slate-200/60", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-slate-50/50 font-medium",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    clickable?: boolean
  }
>(({ className, clickable = false, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-slate-200/60 transition-all duration-200",
      clickable && "cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 hover:shadow-sm",
      !clickable && "hover:bg-slate-50/80",
      "data-[state=selected]:bg-slate-50",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    sortable?: boolean
    sortDirection?: 'asc' | 'desc' | null
  }
>(({ className, sortable = false, sortDirection, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-semibold text-slate-700 tracking-wide",
      "text-xs uppercase border-b border-slate-200/60",
      sortable && "cursor-pointer hover:text-slate-900 hover:bg-slate-100/50 transition-colors duration-200",
      className
    )}
    {...props}
  >
    <div className="flex items-center space-x-2">
      <span>{children}</span>
      {sortable && (
        <div className="flex flex-col">
          <svg 
            className={cn(
              "w-3 h-3 transition-colors duration-200",
              sortDirection === 'asc' ? "text-blue-600" : "text-slate-400"
            )} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg 
            className={cn(
              "w-3 h-3 -mt-1 transition-colors duration-200",
              sortDirection === 'desc' ? "text-blue-600" : "text-slate-400"
            )} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  </th>
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle text-slate-900 transition-colors duration-200",
      "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

// Enhanced Table Components
interface EnhancedTableProps {
  children: React.ReactNode
  className?: string
  loading?: boolean
  emptyState?: React.ReactNode
}

const EnhancedTable = React.forwardRef<
  HTMLDivElement,
  EnhancedTableProps
>(({ children, className, loading = false, emptyState, ...props }, ref) => (
  <div 
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm",
      "backdrop-blur-sm bg-white/95",
      className
    )}
    {...props}
  >
    {loading && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-slate-600 font-medium">กำลังโหลด...</span>
        </div>
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
    {emptyState && (
      <div className="p-8 text-center">
        {emptyState}
      </div>
    )}
  </div>
))
EnhancedTable.displayName = "EnhancedTable"

// Badge Component for Status
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Badge = React.forwardRef<
  HTMLSpanElement,
  BadgeProps
>(({ children, variant = 'default', size = 'md', className, ...props }, ref) => {
  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200", 
    error: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    secondary: "bg-purple-100 text-purple-800 border-purple-200"
  }

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  }

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full font-medium border transition-all duration-200",
        "hover:shadow-sm hover:scale-105",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})
Badge.displayName = "Badge"

// Pagination Component
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  showInfo?: boolean
  className?: string
}

const Pagination = React.forwardRef<
  HTMLDivElement,
  PaginationProps
>(({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage, 
  showInfo = true,
  className,
  ...props 
}, ref) => {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <div 
      ref={ref}
      className={cn(
        "flex items-center justify-between px-6 py-4 border-t border-slate-200/60 bg-slate-50/50",
        className
      )}
      {...props}
    >
      {showInfo && totalItems && itemsPerPage && (
        <div className="text-sm text-slate-600">
          แสดง {((currentPage - 1) * itemsPerPage) + 1} ถึง{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} จาก{' '}
          {totalItems.toLocaleString()} รายการ
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          ก่อนหน้า
        </button>
        
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              page === currentPage
                ? "bg-blue-600 text-white shadow-sm"
                : page === '...'
                ? "text-slate-400 cursor-default"
                : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
            )}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          ถัดไป
        </button>
      </div>
    </div>
  )
})
Pagination.displayName = "Pagination"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  EnhancedTable,
  Badge,
  Pagination,
}