import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create a new Prisma Client instance
export const prisma = globalForPrisma.prisma || 
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

// In development, keep a single connection
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Test the connection and log result
;(async () => {
  try {
    // Test the database connection with a simple query
    await prisma.$queryRaw`SELECT 1+1 as result`;
    console.log('🟢 Database connection successful');
    
    // Count users as another test
    const userCount = await prisma.user.count();
    console.log(`🟢 Database contains ${userCount} users`);
    
  } catch (e) {
    console.error('🔴 Database connection failed:', e);
  }
})();

console.log('Prisma Client initialized:', !!prisma);

export default prisma