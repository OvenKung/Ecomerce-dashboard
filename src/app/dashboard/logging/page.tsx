'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ScrollText, Filter, Search, Download, RefreshCw, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface LogEntry {
  id: string
  createdAt: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
  details?: any
  source: string
  endpoint?: string
  method?: string
  statusCode?: number
  userId?: string
  userRole?: string
  userName?: string
  ipAddress?: string
  userAgent?: string
}

export default function LoggingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.replace('/auth/signin')
    } else if (session.user?.role !== 'SUPER_ADMIN') {
      router.replace('/dashboard/unauthorized')
    }
  }, [session, status, router])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      if (filter !== 'all') {
        params.append('level', filter)
      }

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch logs')

      const data = await response.json()
      setLogs(data.logs)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      fetchLogs()
    }
  }, [session, page, filter])

  // Debounce search
  useEffect(() => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      const timer = setTimeout(() => {
        setPage(1) // Reset to first page on search
        fetchLogs()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  const filteredLogs = logs // API already filters, so we just display

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'WARN':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'INFO':
        return <Info className="h-5 w-5 text-blue-500" />
      case 'DEBUG':
        return <Info className="h-5 w-5 text-gray-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-50 border-red-200'
      case 'WARN':
        return 'bg-yellow-50 border-yellow-200'
      case 'INFO':
        return 'bg-blue-50 border-blue-200'
      case 'DEBUG':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (status === 'loading' || !session) {
    return null
  }

  if (session.user?.role !== 'SUPER_ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <ScrollText className="h-8 w-8 text-blue-600" />
              System Logging
            </h1>
            <p className="text-gray-600 mt-2">Monitor and track all system activities</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => fetchLogs()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card variant="glass">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Level Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('INFO')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'INFO'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Info
                </button>
                <button
                  onClick={() => setFilter('WARN')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'WARN'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Warning
                </button>
                <button
                  onClick={() => setFilter('ERROR')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'ERROR'
                      ? 'bg-red-500 text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Error
                </button>
                <button
                  onClick={() => setFilter('DEBUG')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'DEBUG'
                      ? 'bg-gray-500 text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Debug
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Logs List */}
        <Card variant="glass">
          <div className="p-6">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-500 mb-4" />
                  <p className="text-gray-500">Loading logs...</p>
                </div>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${
                            log.level === 'ERROR' ? 'bg-red-200 text-red-800' :
                            log.level === 'WARN' ? 'bg-yellow-200 text-yellow-800' :
                            log.level === 'DEBUG' ? 'bg-gray-200 text-gray-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {log.level}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{log.message}</p>
                        
                        {/* Request info */}
                        {(log.method || log.endpoint) && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                            {log.method && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded font-mono">
                                {log.method}
                              </span>
                            )}
                            {log.endpoint && (
                              <span className="font-mono">{log.endpoint}</span>
                            )}
                            {log.statusCode && (
                              <span className={`px-2 py-0.5 rounded font-mono ${
                                log.statusCode >= 500 ? 'bg-red-100 text-red-800' :
                                log.statusCode >= 400 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {log.statusCode}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {log.details && (
                          <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                        
                        {/* User info */}
                        {log.userId && (
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                            <span>👤 {log.userName || log.userId}</span>
                            {log.userRole && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                                {log.userRole}
                              </span>
                            )}
                            {log.ipAddress && (
                              <span className="font-mono">📍 {log.ipAddress}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <ScrollText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No logs found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  Showing {logs.length} of {total} logs
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                              : 'bg-white border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
