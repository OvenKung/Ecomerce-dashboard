# คำแนะนำการแก้ไขระบบ Logging

## ปัญหาปัจจุบัน
ระบบ logging ถูกเตรียมไว้แล้วครบถ้วน แต่ database ยังไม่ online ทำให้ไม่สามารถ migrate Prisma schema ได้

## ขั้นตอนการแก้ไขเมื่อ Database กลับมา Online

### 1. รัน Prisma Migration
```bash
npx prisma migrate dev --name add_system_logs
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. รัน Seed Data
```bash
npx prisma db seed
```

หรือถ้าไม่มีคำสั่ง seed ใน package.json ให้รัน:
```bash
npx ts-node prisma/seed.ts
```

### 4. ตรวจสอบ TypeScript Errors
หลังจาก generate Prisma client แล้ว TypeScript errors ทั้งหมดควรหายไป

### 5. อัปเดต Logging Page ให้ใช้ข้อมูลจริง

แก้ไขไฟล์ `/src/app/dashboard/logging/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollText } from 'lucide-react'

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'

interface SystemLog {
  id: string
  level: LogLevel
  message: string
  details: any
  source: string
  endpoint?: string | null
  method?: string | null
  statusCode?: number | null
  userId?: string | null
  userRole?: string | null
  userName?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function LoggingPage() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (selectedLevel !== 'all') {
        params.append('level', selectedLevel)
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/logs?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }

      const data = await response.json()
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, selectedLevel, searchTerm])

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'INFO': return 'text-blue-600 bg-blue-50'
      case 'WARN': return 'text-yellow-600 bg-yellow-50'
      case 'ERROR': return 'text-red-600 bg-red-50'
      case 'DEBUG': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <ScrollText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              System Logs
            </h1>
            <p className="text-sm text-gray-600">
              ดูและจัดการ system logs ทั้งหมด (SUPER_ADMIN เท่านั้น)
            </p>
          </div>
        </div>
        <Button onClick={fetchLogs} disabled={loading}>
          {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            <Button
              variant={selectedLevel === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedLevel('all')}
              size="sm"
            >
              ทั้งหมด
            </Button>
            <Button
              variant={selectedLevel === 'info' ? 'default' : 'outline'}
              onClick={() => setSelectedLevel('info')}
              size="sm"
              className="text-blue-600"
            >
              INFO
            </Button>
            <Button
              variant={selectedLevel === 'warn' ? 'default' : 'outline'}
              onClick={() => setSelectedLevel('warn')}
              size="sm"
              className="text-yellow-600"
            >
              WARN
            </Button>
            <Button
              variant={selectedLevel === 'error' ? 'default' : 'outline'}
              onClick={() => setSelectedLevel('error')}
              size="sm"
              className="text-red-600"
            >
              ERROR
            </Button>
          </div>
          
          <input
            type="text"
            placeholder="ค้นหา logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
        </div>
      </Card>

      {/* Logs List */}
      <Card className="p-4">
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">ไม่พบข้อมูล logs</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                      {log.source && (
                        <span className="px-2 py-1 rounded text-xs bg-gray-100">
                          {log.source}
                        </span>
                      )}
                      {log.method && log.endpoint && (
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                          {log.method} {log.endpoint}
                        </span>
                      )}
                      {log.statusCode && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.statusCode >= 200 && log.statusCode < 300 ? 'bg-green-100 text-green-700' :
                          log.statusCode >= 400 && log.statusCode < 500 ? 'bg-yellow-100 text-yellow-700' :
                          log.statusCode >= 500 ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.statusCode}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">{log.message}</p>
                    {log.userName && (
                      <p className="text-xs text-gray-600">
                        ผู้ใช้: {log.userName} ({log.userRole})
                      </p>
                    )}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          ดูรายละเอียดเพิ่มเติม
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    {new Date(log.createdAt).toLocaleString('th-TH')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              หน้า {pagination.page} จาก {pagination.totalPages} ({pagination.total} รายการ)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={!pagination.hasPrev}
              >
                ก่อนหน้า
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={!pagination.hasNext}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
```

## สิ่งที่เตรียมไว้แล้ว

### 1. Database Schema ✅
- สร้าง `SystemLog` model ใน `prisma/schema.prisma`
- มี fields ครบถ้วน: level, message, details, source, endpoint, method, statusCode, userId, userRole, userName, ipAddress, userAgent, createdAt
- มี indexes สำหรับ performance: level, userId, createdAt
- มี LogLevel enum: INFO, WARN, ERROR, DEBUG

### 2. Logger Utility ✅
- ไฟล์: `/src/lib/logger.ts`
- Server-side logging: `logger.info()`, `logger.warn()`, `logger.error()`, `logger.debug()`
- Client-side logging: `logClient(level, message, details)`
- บันทึกลง database อัตโนมัติ
- SUPER_ADMIN permission check

### 3. API Endpoints ✅
- POST `/api/log`: รับ logs จาก client-side
- GET `/api/logs`: ดึง logs พร้อม filtering, search, pagination (SUPER_ADMIN only)

### 4. UI Page ✅
- หน้า `/dashboard/logging` สำหรับดู logs
- Filter ตาม level (all/info/warn/error)
- Search functionality
- แสดงรายละเอียดครบถ้วน
- พร้อม pagination (รอเชื่อมต่อ API)

### 5. Permissions ✅
- เพิ่ม LOGS resource ใน permissions.ts
- Sidebar menu สำหรับ SUPER_ADMIN
- Page protection

### 6. Seed Data ✅
- สร้าง 200 log entries ตัวอย่าง
- ครอบคลุมทุก level, ทุก user, ย้อนหลัง 30 วัน
- มีข้อมูลครบถ้วน: who, what, when, where

## การใช้งาน Logging

### Server-side (API Routes, Server Components)
```typescript
import { logger } from '@/lib/logger'

// INFO
await logger.info('ดึงข้อมูลสำเร็จ', { count: 10 })

// WARN
await logger.warn('สินค้าใกล้หมดสต็อก', { productId: '123', stock: 2 })

// ERROR
await logger.error('การชำระเงินล้มเหลว', { orderId: '456', error: 'timeout' })

// DEBUG
await logger.debug('ตรวจสอบค่า parameter', { userId, action: 'delete' })
```

### Client-side (Browser)
```typescript
import { logClient } from '@/lib/logger'

logClient('info', 'ผู้ใช้คลิกปุ่ม', { buttonId: 'submit' })
logClient('error', 'Form validation failed', { errors })
```

## ข้อมูลที่บันทึก

ทุก log จะมีข้อมูล:
- ✅ **Who**: userId, userName, userRole
- ✅ **What**: message, details (JSON), level
- ✅ **When**: createdAt (timestamp)
- ✅ **Where**: source (server/client), endpoint, method
- ✅ **How**: statusCode, ipAddress, userAgent

## Notes
- ทุก TypeScript error จะหายหลังจาก run migration และ generate Prisma client
- Seed จะสร้าง logs ตัวอย่าง 200 รายการ
- API มี pagination, filtering, และ search พร้อมใช้งาน
- เฉพาะ SUPER_ADMIN เท่านั้นที่เห็นและสร้าง logs
