# Database Connection Issue - Quick Fix Guide

## Issue
Your Supabase database connection is failing because the project is likely paused.

## Quick Fix Options

### Option 1: Resume Supabase Project (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Find your project: `ddnorzobszfrluiiiplo`
3. If it shows "Paused", click **Resume** to reactivate it
4. Wait 1-2 minutes for the database to fully start
5. Test your login again

### Option 2: Use Local Database for Development
If you want to avoid pausing issues during development:

```bash
# Install PostgreSQL locally
brew install postgresql
brew services start postgresql

# Create local database
createdb ecommerce_dashboard

# Update .env for local development
DATABASE_URL="postgresql://localhost:5432/ecommerce_dashboard"
DIRECT_URL="postgresql://localhost:5432/ecommerce_dashboard"
```

### Option 3: Update Connection Settings
Sometimes connection issues can be resolved by modifying the connection string:

```env
# Try without pgbouncer for troubleshooting
DATABASE_URL="postgres://postgres.ddnorzobszfrluiiiplo:nQSw5DMBNXFoRD65@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

## After Fixing Connection
Once your database is accessible:

```bash
# Push your schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed your database (if needed)
npm run seed
```

## Prevention
To prevent Supabase from pausing:
- Use your app regularly (every few days)
- Consider upgrading to Supabase Pro for always-on databases
- Set up monitoring/health checks to keep it active

## Testing
Run the connection test to verify:
```bash
node test-direct-connection.js
```