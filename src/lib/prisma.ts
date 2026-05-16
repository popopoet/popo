import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url =
    process.env.DATABASE_POSTGRES_PRISMA_URL ??
    process.env.DATABASE_URL

  if (!url) {
    const adapter = new PrismaPg({
      connectionString: 'postgresql://localhost:5432/xaujournal',
    })
    return new PrismaClient({ adapter })
  }

  const u = new URL(url)
  const adapter = new PrismaPg({
    host: u.hostname,
    port: Number(u.port) || 5432,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1) || 'postgres',
    max: 1,
    ssl: { rejectUnauthorized: false },
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
