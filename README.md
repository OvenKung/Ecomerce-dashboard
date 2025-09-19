# E-Commerce Dashboard

## ระบบจัดการร้านค้าออนไลน์ที่ครบครัน
Professional e-commerce dashboard built with modern technologies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or use Bun.js)
- PostgreSQL (for production)

### Installation
```bash
# Using Bun.js (recommended)
bun install
bun dev

# Or using npm
npm install
npm run dev
```

### Access the Application
- **URL**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard

## 🔐 Test Credentials

### Admin Account
- **Email**: `admin@test.com`
- **Password**: `password`
- **Permissions**: Full system access

### Staff Account  
- **Email**: `staff@test.com`
- **Password**: `password`
- **Permissions**: Limited dashboard access

## 🛠 Tech Stack

- **Runtime**: Bun.js 1.2.2
- **Framework**: Next.js 15.5.3 with Turbopack
- **Database**: Prisma 6.16.2 + PostgreSQL
- **Authentication**: NextAuth.js 4.24.11
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5

## 📋 Features Overview

### ✅ Completed
- [x] Project setup with modern tech stack
- [x] Comprehensive database schema (20+ models)
- [x] Authentication system with RBAC
- [x] Responsive dashboard layout (Thai interface)
- [x] Professional sidebar navigation

### 🚧 In Development
- [ ] Catalog Management (Products, Inventory, Categories)
- [ ] Order Management System
- [ ] Customer CRM Features
- [ ] Marketing & Pricing Tools
- [ ] Analytics Dashboard
- [ ] System Operations Panel

## 🏗 Architecture

### Database Models
- **Users & Auth**: Users, Roles, Sessions, Audit Logs
- **Catalog**: Products, Categories, Brands, Inventory, SKUs
- **Orders**: Orders, Order Items, Payments, Refunds
- **Customers**: Customer Profiles, Addresses, Notes
- **Marketing**: Coupons, Promotions, Flash Sales
- **Analytics**: Sales Data, Reports, KPIs

### Security Features
- Role-based access control (Admin/Staff/Viewer)
- JWT session management
- Audit logging for all actions
- Route protection middleware

## 🎨 UI/UX Features

- **Thai Language Interface**: Complete localization
- **Responsive Design**: Mobile-first approach
- **Professional Theme**: Clean, modern design
- **Accessibility**: ARIA labels and keyboard navigation
- **Dark Mode**: (Coming soon)

## 🔧 Development Notes

### Current Configuration
- **Environment**: Development mode with in-memory auth
- **Database**: Schema ready, using test data
- **Middleware**: Simplified for debugging (will be enhanced)

### Production Deployment
1. Configure PostgreSQL connection in `.env`
2. Run database migrations: `bunx prisma migrate deploy`
3. Enable full middleware and Prisma adapter
4. Configure OAuth providers (Google, etc.)

## 📊 Performance

- **Build Tool**: Turbopack for fast development
- **Package Manager**: Bun.js for speed
- **Database**: Prisma for type-safe queries
- **Caching**: NextAuth.js session caching

## 🤝 Contributing

This is a professional e-commerce dashboard project. Follow Thai coding standards and maintain comprehensive documentation.

## 📝 License

Private project - All rights reserved

---

### System Status: ✅ Ready for Development
**Next Steps**: Implement catalog management features

**Last Updated**: December 2024
