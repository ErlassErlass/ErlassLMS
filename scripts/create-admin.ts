
import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = "admin@erlass.com"
  const password = await bcrypt.hash("admin123", 10)

  await prisma.user.upsert({
    where: { email },
    update: { role: 'SUPERADMIN' },
    create: {
      email,
      name: "Super Admin",
      password,
      role: 'SUPERADMIN'
    }
  })
  
  console.log("✅ Super Admin created: admin@erlass.com / admin123")
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
