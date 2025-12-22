
import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting Moodle V2.0 Simulation Seed...")

  // --- 1. SETUP COHORTS (SCHOOLS) ---
  console.log("🏫 Creating 20 Schools (Cohorts)...")
  const schools = []
  for (let i = 1; i <= 20; i++) {
    schools.push(`SDN ${i} Jakarta`)
  }
  // Note: We use User.schoolCode/school string for now as per schema

  // --- 2. SETUP CATEGORIES ---
  console.log("📁 Creating Categories...")
  const categories = [
    { name: "Free Courses", slug: "free-courses" },
    { name: "Premium Courses", slug: "premium-courses" },
    { name: "Teacher Resources", slug: "teacher-resources" }
  ]

  for (const cat of categories) {
    await prisma.courseCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug }
    })
  }

  // --- 3. SETUP MENTORS (40 Total) ---
  console.log("🛰️ Creating 40 Mentors (Starfleet Captains)...")
  const passwordHash = await bcrypt.hash('password123', 10)
  
  const mentors = []
  
  // Helper to create mentor
  const createMentor = async (index: number, specialty: string[]) => {
    const email = `mentor${index}.${specialty[0].toLowerCase()}@erlass.com`
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `Captain ${specialty.join('+')} ${index}`,
        password: passwordHash,
        role: 'MENTOR',
        emailVerified: new Date()
      }
    })

    await prisma.mentor.upsert({
      where: { userId: user.id },
      update: { specialties: specialty },
      create: {
        userId: user.id,
        bio: `Expert in ${specialty.join(' and ')}`,
        specialties: specialty,
        isVerified: true
      }
    })
    return user
  }

  // 5 AI Mentors
  for (let i = 1; i <= 5; i++) mentors.push(await createMentor(i, ['AI']))
  // 10 Python Mentors
  for (let i = 6; i <= 15; i++) mentors.push(await createMentor(i, ['Python']))
  // 15 Scratch Mentors
  for (let i = 16; i <= 30; i++) mentors.push(await createMentor(i, ['Scratch']))
  // 10 Python+Scratch Mentors
  for (let i = 31; i <= 40; i++) mentors.push(await createMentor(i, ['Python', 'Scratch']))


  // --- 4. SETUP COURSES ---
  console.log("📚 Creating Courses & Assigning Mentors...")
  const admin = await prisma.user.findFirst({ where: { role: 'SUPERADMIN' } }) || mentors[0]

  const createCourse = async (title: string, categorySlug: string, topic: string, assignedMentors: any[]) => {
    const category = await prisma.courseCategory.findUnique({ where: { slug: categorySlug } })
    
    const course = await prisma.course.create({
      data: {
        title,
        description: `Learn ${topic} in this course.`,
        category: topic,
        categoryId: category?.id,
        level: categorySlug.includes('free') ? 'Beginner' : 'Advanced',
        price: categorySlug.includes('free') ? 0 : 500000,
        isPremium: !categorySlug.includes('free'),
        createdById: admin.id, // Creator is admin
        isPublished: true
      }
    })

    // Assign Mentors
    for (const mentorUser of assignedMentors) {
      const mentorProfile = await prisma.mentor.findUnique({ where: { userId: mentorUser.id } })
      if (mentorProfile) {
        await prisma.courseMentor.create({
          data: {
            courseId: course.id,
            mentorId: mentorProfile.id
          }
        })
      }
    }
    return course
  }

  // Define Groups
  const pythonMentors = mentors.filter(m => m.name.includes('Python'))
  const scratchMentors = mentors.filter(m => m.name.includes('Scratch'))
  const aiMentors = mentors.filter(m => m.name.includes('AI'))

  // Create Specific Courses
  const pythonFree = await createCourse("Python Dasar", "free-courses", "Python", pythonMentors.slice(0, 2))
  const scratchFree = await createCourse("Scratch Pemula", "free-courses", "Scratch", scratchMentors.slice(0, 2))
  const aiFree = await createCourse("AI Pengenalan", "free-courses", "AI", aiMentors.slice(0, 2))

  const pythonPremium = await createCourse("Python Lanjutan", "premium-courses", "Python", pythonMentors)
  const scratchPremium = await createCourse("Scratch Game Developer", "premium-courses", "Scratch", scratchMentors)
  const aiPremium = await createCourse("AI dengan Python", "premium-courses", "AI", aiMentors)


  // --- 5. SETUP STUDENTS (1000 Total) ---
  console.log("👨‍🚀 Creating 1000 Students (Space Cadets/Explorers/Patrons)...")
  
  // NOTE: Creating 1000 users is heavy. We will create a sample of 50 to represent the distribution 
  // to avoid timeout, but structure loop for full scale if needed.
  // 1000 users / 20 schools = 50 per school.
  
  const SAMPLE_SIZE = 50 // Changed from 1000 to 50 for speed in this demo
  console.log(`(Simulating subset of ${SAMPLE_SIZE} students for performance)`)

  const students = []
  for (let i = 1; i <= SAMPLE_SIZE; i++) {
    const schoolIndex = i % 20
    const schoolName = schools[schoolIndex]
    
    // Distribution Logic: 10% AI, 30% Python, 60% Scratch
    let interest = 'Scratch'
    let courseToEnroll = scratchFree
    
    if (i <= (SAMPLE_SIZE * 0.1)) {
        interest = 'AI'
        courseToEnroll = aiFree
    } else if (i <= (SAMPLE_SIZE * 0.4)) {
        interest = 'Python'
        courseToEnroll = pythonFree
    }

    const user = await prisma.user.create({
      data: {
        email: `student${i}@school.com`,
        name: `Student ${i}`,
        password: passwordHash,
        role: 'USER',
        school: schoolName,
        schoolCode: `SCH-${schoolIndex + 1}`,
        emailVerified: new Date()
      }
    })

    // Enroll to Free Course (Star Explorer)
    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: courseToEnroll.id,
        status: 'ENROLLED'
      }
    })

    students.push(user)
  }

  // --- 6. SIMULATE PREMIUM UPGRADE (Galactic Patron) ---
  console.log("💰 Upgrading some students to Galactic Patron...")
  const premiumCount = Math.floor(SAMPLE_SIZE * 0.2) // 20% buy premium
  
  for (let i = 0; i < premiumCount; i++) {
    const student = students[i]
    // Enroll in Premium
    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: pythonPremium.id, // Simplified
        status: 'ENROLLED'
      }
    })
    
    // Update Subscription
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    await prisma.user.update({
        where: { id: student.id },
        data: { subscriptionExpires: nextYear }
    })
  }

  console.log("✅ Simulation Seed Completed Successfully!")
  console.log(`
    Stats:
    - Schools: 20
    - Mentors: 40 (Assigned to courses)
    - Courses: 6 (3 Free, 3 Premium)
    - Students: ${SAMPLE_SIZE} (Distributed)
  `)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
