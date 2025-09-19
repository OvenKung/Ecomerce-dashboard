# E-Commerce Dashboard

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.16.2-2D3748?logo=prisma&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.2.2-000?logo=bun&logoColor=white)

ระบบจัดการร้านค้าออนไลน์ที่ครบครัน พร้อม UI/UX ที่ทันสมัย

## Live Demo

### Demo URL

🚀 **Live Demo**: <https://ecomerce-dashboard-two.vercel.app/>

### Try it Now - Local Setup

```bash
git clone https://github.com/OvenKung/Ecomerce-dashboard.git
cd e-com-dashboard
bun install && bun dev
```

Access: <http://localhost:3000/dashboard>

### Demo Credentials

| บทบาท | Email | Password | สิทธิ์การเข้าถึง |
|--------|-------|----------|----------------|
| Super Admin | admin@test.com | password | เข้าถึงได้ทุกระบบ |
| Manager | manager@test.com | 123456 | จัดการสินค้าและออเดอร์ |
| Staff | staff@test.com | 123456 | ดูข้อมูลและอัพเดทสถานะ |

## Features

### UI/UX ที่ทันสมัย

- Glass Morphism Design - เอฟเฟคแก้วโปร่งใสที่สวยงาม
- Gradient Backgrounds - พื้นหลังไล่สีที่หลากหลาย
- Responsive Design - รองรับทุกขนาดหน้าจอ
- Thai Language Interface - อินเทอร์เฟซภาษาไทยครบถ้วน
- Smooth Animations - ความเคลื่อนไหวที่นุ่มนวล

### ระบบจัดการที่ครบครัน

#### Dashboard & Analytics

- Real-time Statistics - สถิติแบบเรียลไทม์
- Interactive Charts - กราฟแบบโต้ตอบได้
- KPI Monitoring - ติดตาม KPI สำคัญ
- Performance Metrics - เมตริกการทำงาน

#### User Management

- Role-Based Access Control (RBAC) - ควบคุมสิทธิ์ตามบทบาท
- User Authentication - ระบบยืนยันตัวตน
- Permission Management - จัดการสิทธิ์แบบละเอียด
- Audit Logging - บันทึกการใช้งานระบบ

#### E-Commerce Features

- Product Catalog - แคตาล็อกสินค้า
- Inventory Management - จัดการสต็อกสินค้า
- Order Processing - ประมวลผลออเดอร์
- Customer CRM - จัดการลูกค้า
- Marketing Tools - เครื่องมือการตลาด
- Reports & Analytics - รายงานและการวิเคราะห์

## Tech Stack

### Frontend

- Next.js 15.5.3 - React Framework with App Router
- TypeScript 5 - Type-safe development
- Tailwind CSS 4 - Utility-first CSS framework
- Lucide Icons - Beautiful icon library
- Framer Motion - Animation library

### Backend

- Next.js API Routes - Full-stack framework
- Prisma 6.16.2 - Next-generation ORM
- PostgreSQL - Relational database
- NextAuth.js 4.24.11 - Authentication

### Development Tools

- Bun.js 1.2.2 - Fast JavaScript runtime
- Turbopack - Fast bundler by Vercel
- ESLint - Code quality
- Prettier - Code formatting

## Installation

### Prerequisites

- Node.js 18+ (หรือใช้ Bun.js)
- PostgreSQL (สำหรับ production)
- Git

### Quick Start

1. Clone Repository

```bash
git clone https://github.com/OvenKung/Ecomerce-dashboard.git
cd e-com-dashboard
```

2. Install Dependencies

```bash
# Using Bun.js (recommended)
bun install

# Or using npm
npm install
```

3. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Database Setup

```bash
# Generate Prisma client
bun db:generate

# Run migrations
bun db:migrate

# Seed test data
bun db:seed
```

5. Start Development Server

```bash
bun dev
```

6. Access Application

- Frontend: <http://localhost:3000>
- Dashboard: <http://localhost:3000/dashboard>
- Database Studio: `bun db:studio`

## Project Structure

```text
e-com-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── api/               # API routes
│   │   └── (auth)/            # Authentication pages
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   └── dashboard/        # Dashboard components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   └── types/                # TypeScript types
├── prisma/                   # Database schema & migrations
├── public/                   # Static assets
└── scripts/                  # Database scripts
```

## Authentication & Security

### Security Features

- JWT-based authentication - ปลอดภัยและยืดหยุ่น
- Role-based permissions - ควบคุมสิทธิ์ตามบทบาท
- CSRF protection - ป้องกันการโจมตี CSRF
- SQL injection prevention - ป้องกัน SQL injection
- XSS protection - ป้องกันการโจมตี XSS

### User Roles

| บทบาท | สิทธิ์ | การใช้งาน |
|--------|--------|----------|
| SUPER_ADMIN | ทุกอย่าง | จัดการระบบทั้งหมด |
| ADMIN | สูง | จัดการผู้ใช้และข้อมูล |
| MANAGER | ปานกลาง | จัดการสินค้าและออเดอร์ |
| STAFF | จำกัด | ดูข้อมูลและอัพเดทสถานะ |
| VIEWER | อ่านอย่างเดียว | ดูรายงานและสถิติ |

## Screenshots

### Dashboard Home

Modern dashboard with glass morphism design and real-time statistics

### User Management

Comprehensive user management with role-based permissions

### Product Catalog

Product management with inventory tracking

### Analytics

Beautiful charts and reports with Thai language support

## Deployment

### Vercel (Recommended)

1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Deploy to Vercel

   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically

3. Database Setup

   - Use Vercel Postgres or external PostgreSQL
   - Run migrations: `npx prisma migrate deploy`

### Manual Deployment

1. Build Application

```bash
bun build
```

2. Set Production Environment
3. Run Database Migrations
4. Start Production Server

```bash
bun start
```

## Documentation

### Development

- [API Documentation](./docs/API.md)
- [Component Guide](./docs/COMPONENTS.md)
- [Database Schema](./docs/DATABASE.md)

### Deployment

- [Vercel Deployment](./VERCEL_DEPLOY.md)
- [Docker Setup](./docs/DOCKER.md)
- [Environment Variables](./docs/ENVIRONMENT.md)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Coding Standards

- Follow Thai language for UI text
- Use TypeScript for type safety
- Write comprehensive tests
- Follow ESLint configuration
- Document API endpoints

## Known Issues

- [ ] Dark mode implementation (planned)
- [ ] Mobile optimization for tables
- [ ] Email notification system
- [ ] Advanced search filters

## Roadmap

### Phase 1 (Current)

- [x] Project setup with modern tech stack
- [x] Authentication system with RBAC
- [x] Responsive dashboard layout
- [x] Glass morphism UI components

### Phase 2 (Next)

- [ ] Complete product catalog management
- [ ] Order processing system
- [ ] Customer CRM features
- [ ] Payment integration

### Phase 3 (Future)

- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations

## Support

- Email: <support@example.com>
- Documentation: [GitHub Wiki](https://github.com/OvenKung/Ecomerce-dashboard/wiki)
- Issues: [GitHub Issues](https://github.com/OvenKung/Ecomerce-dashboard/issues)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js Team - Amazing React framework
- Vercel - Deployment platform
- Prisma - Database toolkit
- Tailwind CSS - CSS framework
- Thai Developer Community - Inspiration and support

---

Made with ❤️ by [OvenKung](https://github.com/OvenKung)

⭐ ถ้าชอบโปรเจคนี้ กรุณาให้ Star ด้วยนะครับ!