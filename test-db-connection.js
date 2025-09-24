const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Connected to database successfully')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful:', result)
    
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error meta:', error.meta)
    
    if (error.code === 'P1001') {
      console.log('\n📋 Troubleshooting suggestions:')
      console.log('1. Check if your Supabase project is active (not paused)')
      console.log('2. Verify your DATABASE_URL in .env file')
      console.log('3. Check your internet connection')
      console.log('4. Try using DIRECT_URL instead of DATABASE_URL')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()