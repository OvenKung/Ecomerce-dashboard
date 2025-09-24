const { PrismaClient } = require('@prisma/client')

async function testDirectConnection() {
  // Test with DIRECT_URL instead of pooled connection
  const directUrl = process.env.DIRECT_URL
  console.log('Testing direct connection...')
  console.log('Direct URL:', directUrl?.replace(/:[^:@]*@/, ':***@'))

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: directUrl
      }
    },
    log: ['error'],
  })

  try {
    await prisma.$connect()
    console.log('✅ Direct connection successful!')
    
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Direct query successful:', result)
    
  } catch (error) {
    console.error('❌ Direct connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

async function testPooledConnection() {
  // Test with pooled connection (DATABASE_URL)
  const pooledUrl = process.env.DATABASE_URL
  console.log('\nTesting pooled connection...')
  console.log('Pooled URL:', pooledUrl?.replace(/:[^:@]*@/, ':***@'))

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: pooledUrl
      }
    },
    log: ['error'],
  })

  try {
    await prisma.$connect()
    console.log('✅ Pooled connection successful!')
    
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Pooled query successful:', result)
    
  } catch (error) {
    console.error('❌ Pooled connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  console.log('🔍 Testing Supabase connections...\n')
  
  await testDirectConnection()
  await testPooledConnection()
  
  console.log('\n📋 If both connections fail:')
  console.log('1. Check your Supabase dashboard: https://supabase.com/dashboard')
  console.log('2. Make sure your project is not paused')
  console.log('3. Try restarting your project if it\'s paused')
  console.log('4. Check if you need to update your connection strings')
}

main()