# Vercel Deployment Guide

โปรเจค E-commerce Dashboard พร้อม deploy ใน Vercel แล้ว!

## 🚀 การ Deploy ใน Vercel

### 1. เตรียม Production Database

สำหรับ production คุณต้องใช้ PostgreSQL แทน SQLite:

**ตัวเลือก Database:**
- **Vercel Postgres** (แนะนำ) - ติดตั้งได้จาก Vercel Dashboard
- **Supabase** - มี free tier ให้ใช้
- **PlanetScale** - MySQL-compatible
- **Railway** - รองรับ PostgreSQL

### 2. ตั้งค่า Environment Variables ใน Vercel

ไปที่ Vercel Dashboard → Project Settings → Environment Variables

**ตัวแปรที่จำเป็น:**

```bash
# Database
DATABASE_URL="your-production-postgres-url"
DIRECT_URL="your-direct-database-url" # สำหรับ connection pooling

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-strong-secret-key-32-chars"

# JWT
JWT_SECRET="generate-strong-jwt-secret-32-chars"

# App Settings
NODE_ENV="production"
APP_NAME="E-commerce Dashboard"
APP_URL="https://your-app.vercel.app"

# Optional: OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Deploy Steps

1. **Push ไปยัง GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect กับ Vercel**:
   - ไป https://vercel.com
   - Import จาก GitHub repository
   - เลือก repository นี้

3. **Configure Build Settings**:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Root Directory: `./`

4. **ตั้งค่า Environment Variables** ตามรายการข้างต้น

5. **Deploy**!

### 4. หลังจาก Deploy

1. **Setup Database**:
   ```bash
   # ใน Vercel, เพิ่ม build command:
   npx prisma migrate deploy && npm run build
   ```

2. **Seed ข้อมูลเริ่มต้น** (ถ้าต้องการ):
   - เข้า Vercel Dashboard → Functions → Run command
   - หรือใช้ Prisma Studio online

### 5. การอัปเดต

เมื่อมีการเปลี่ยนแปลง database schema:

1. สร้าง migration:
   ```bash
   npx prisma migrate dev --name your-migration-name
   ```

2. Push และ deploy:
   ```bash
   git add .
   git commit -m "Database migration"
   git push origin main
   ```

## 🔧 Build Configuration

- **vercel.json**: กำหนดค่า build และ function timeouts
- **package.json**: เพิ่ม `postinstall` script สำหรับ Prisma
- **prisma/schema.prisma**: เปลี่ยนจาก SQLite เป็น PostgreSQL

## ⚠️ สิ่งที่ต้องระวัง

1. **Database Connections**: Vercel Serverless Functions มีข้อจำกัดเรื่อง connections
2. **File Uploads**: ไฟล์อัปโหลดจะหายหลัง deployment - ใช้ Cloudinary หรือ AWS S3
3. **Environment Variables**: อย่าใส่ค่า sensitive ใน code
4. **Cold Starts**: Functions อาจช้าในครั้งแรกที่เรียกใช้

## 🎯 Production Checklist

- [ ] Database URL ตั้งค่าแล้ว
- [ ] NEXTAUTH_SECRET generate ใหม่
- [ ] JWT_SECRET generate ใหม่  
- [ ] NEXTAUTH_URL ชี้ไป production domain
- [ ] Database migration ทำแล้ว
- [ ] ทดสอบ login/logout
- [ ] ทดสอบ CRUD operations
- [ ] ตรวจสอบ permissions

## 📱 การใช้งาน

หลังจาก deploy สำเร็จ:

1. เข้า https://your-app.vercel.app
2. สร้าง user แรกผ่าน registration
3. ปรับ role เป็น ADMIN ผ่าน database
4. เริ่มใช้งาน dashboard!

---

Good luck! 🚀