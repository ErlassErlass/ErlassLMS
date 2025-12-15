import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Prevent multiple instances of Prisma Client in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma