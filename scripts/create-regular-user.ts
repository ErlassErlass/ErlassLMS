import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating regular user...')

  const email = 'user@example.com'
  const password = 'password123'

  let user = await prisma.user.findFirst({
    where: {
      email: email
    }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email,
        name: 'Regular User',
        password: await bcrypt.hash(password, 10),
        role: 'USER',
        phone: '+6281234567892',
        // Optional: Add some starter XP/Level if you want
        xp: 0,
        level: 1
      }
    })
    console.log(`Created regular user: ${email} / ${password}`)
  } else {
    console.log(`User ${email} already exists.`)
    // Update password to ensure it is known
    await prisma.user.update({
      where: { email: email },
      data: {
        password: await bcrypt.hash(password, 10)
      }
    })
    console.log(`Updated password for ${email} to '${password}'`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
