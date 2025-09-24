#!/bin/bash

echo "🚀 Setting up local PostgreSQL for development..."

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
brew install postgresql@14

# Start PostgreSQL service
echo "▶️ Starting PostgreSQL service..."
brew services start postgresql@14

# Wait a moment for service to start
sleep 3

# Create database
echo "🗄️ Creating database..."
createdb ecommerce_dashboard

echo "✅ Local PostgreSQL setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env file to use local database"
echo "2. Run 'npx prisma db push' to create tables"
echo "3. Run 'npm run seed' to add initial data"
echo ""
echo "🔧 Local DATABASE_URL:"
echo "DATABASE_URL=\"postgresql://$(whoami)@localhost:5432/ecommerce_dashboard\""