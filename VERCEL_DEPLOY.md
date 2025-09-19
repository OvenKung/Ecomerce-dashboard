# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Database: Supabase PostgreSQL connected
- [x] Schema: Tables created and seeded
- [x] Environment: Updated for production
- [x] Build: Tested locally
- [x] Config: vercel.json created

## 📝 Environment Variables for Vercel

Copy these exact values to Vercel Dashboard:

### Database & Supabase
```
DATABASE_URL=postgres://postgres.ddnorzobszfrluiiiplo:nQSw5DMBNXFoRD65@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

DIRECT_URL=postgres://postgres.ddnorzobszfrluiiiplo:nQSw5DMBNXFoRD65@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require

SUPABASE_URL=https://ddnorzobszfrluiiiplo.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbm9yem9ic3pmcmx1aWlpcGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNDA4NjMsImV4cCI6MjA3MzgxNjg2M30.epZsYHiZM8r-NhGC8o6soc_Zt9UnwBvsqCNZxkkKJz0

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbm9yem9ic3pmcmx1aWlpcGxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI0MDg2MywiZXhwIjoyMDczODE2ODYzfQ.dPBsTMby_yb6ALEcwF__u1T5O75QnH0FNHAMMO8VTqg
```

### Authentication & Security
```
NEXTAUTH_SECRET=supabase-e-commerce-dashboard-secret-2025
JWT_SECRET=jwt-secret-for-ecommerce-dashboard-2025
```

### App Configuration
```
NODE_ENV=production
APP_NAME=E-commerce Dashboard
```

### URLs (Update after getting Vercel domain)
```
NEXTAUTH_URL=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app
```

## 🔗 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment with Supabase"
git push origin main
```

### Step 2: Create Vercel Project
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import from GitHub
4. Select this repository

### Step 3: Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Root Directory**: `./`

### Step 4: Add Environment Variables
1. Go to Project Settings → Environment Variables
2. Add all variables from above
3. Set Environment: Production

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Get your deployment URL

### Step 6: Update URLs
After getting your Vercel URL (e.g., https://your-app.vercel.app):
1. Update `NEXTAUTH_URL` in Vercel environment variables
2. Update `APP_URL` in Vercel environment variables
3. Redeploy

## 🔑 Login Credentials

After deployment, use these credentials:

- **Admin**: admin@example.com / admin123
- **Manager**: manager@example.com / admin123
- **Staff**: staff@example.com / admin123

## 🔧 Post-Deployment

1. **Test Login**: Try logging in with admin credentials
2. **Test Features**: Create/Read/Update/Delete operations
3. **Check Database**: Verify data is persisting
4. **Monitor Logs**: Check Vercel function logs if issues occur

## 🚨 Troubleshooting

### Common Issues:
1. **Build Fails**: Check environment variables
2. **Database Connection**: Verify Supabase URLs
3. **Authentication Issues**: Check NEXTAUTH_URL matches domain
4. **Function Timeouts**: Check Vercel function limits

### Debug Commands:
```bash
# Local test before deploy
npm run build
npm run start

# Check database connection
npx prisma studio
```

## 📱 Expected Result

After successful deployment:
- ✅ App accessible at Vercel URL
- ✅ Login system working
- ✅ Dashboard loads with data
- ✅ CRUD operations functional
- ✅ Database persisting changes

---

🎉 **Ready to Deploy!** All configurations are set up for Supabase + Vercel deployment.