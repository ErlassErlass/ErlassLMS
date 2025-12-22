import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addShowcaseField() {
  try {
    // Execute raw SQL to add the isShowcase column to challenge_submissions table
    await prisma.$executeRaw`ALTER TABLE "challenge_submissions" ADD COLUMN IF NOT EXISTS "is_showcase" BOOLEAN DEFAULT FALSE`;
    
    console.log('Successfully added isShowcase column to challenge_submissions table');
  } catch (error) {
    console.error('Error adding isShowcase column:', error);
  } finally {
    await prisma.$disconnect()
  }
}

addShowcaseField()