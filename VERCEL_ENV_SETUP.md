# Vercel Environment Variables Setup

## สำคัญ! ต้องตั้งค่าใน Vercel Dashboard

ไปที่ Project Settings > Environment Variables ใน Vercel และเพิ่ม:

```env
# Database
DATABASE_URL=postgres://postgres.ddnorzobszfrluiiiplo:nQSw5DMBNXFoRD65@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
DIRECT_URL=postgres://postgres.ddnorzobszfrluiiiplo:nQSw5DMBNXFoRD65@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require

# Supabase
SUPABASE_URL=https://ddnorzobszfrluiiiplo.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbm9yem9ic3pmcmx1aWlpcGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNDA4NjMsImV4cCI6MjA3MzgxNjg2M30.epZsYHiZM8r-NhGC8o6soc_Zt9UnwBvsqCNZxkkKJz0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbm9yem9ic3pmcmx1aWlpcGxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI0MDg2MywiZXhwIjoyMDczODE2ODYzfQ.dPBsTMby_yb6ALEcwF__u1T5O75QnH0FNHAMMO8VTqg

# NextAuth - ⚠️ สำคัญมาก!
NEXTAUTH_URL=https://ecomerce-dashboard-two.vercel.app
NEXTAUTH_SECRET=supabase-e-commerce-dashboard-secret-2025

# JWT
JWT_SECRET=jwt-secret-for-ecommerce-dashboard-2025

# Google OAuth (ปล่อยว่างก่อนได้)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## ขั้นตอนแก้ไข:

1. ✅ แก้ไข signIn page path ใน auth.ts แล้ว
2. ⚠️ ตรวจสอบ NEXTAUTH_URL ใน Vercel ต้องเป็น: `https://ecomerce-dashboard-two.vercel.app`
3. ⚠️ ตรวจสอบ NEXTAUTH_SECRET ต้องมีค่า
4. ⚠️ ตรวจสอบ DATABASE_URL ต้องถูกต้อง

## หลังจากแก้ไข:
- Redeploy ใน Vercel
- ลองใส่ admin@test.com / password