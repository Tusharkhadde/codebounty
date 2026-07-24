import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const globalForPrisma = global as unknown as { prisma: PrismaClient | null }

export function getPrisma(): PrismaClient | null {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEONDB_URL
    
  if (!connectionString) return null

  try {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool as any)
    const client = new PrismaClient({ adapter } as any)
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }
    return client
  } catch (err) {
    console.error('Failed to initialize Prisma Client:', err)
    return null
  }
}
