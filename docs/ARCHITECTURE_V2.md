# Moodle V2.0 Blueprint - Architecture Implementation Guide

## 1. Overview
This document outlines the technical implementation of the "Moodle V2.0" blueprint within the existing Erlass Platform architecture. The goal is to support 1000+ students, 20 schools, and 40 mentors using the current Next.js + Prisma stack with minimal schema alterations.

## 2. Role Mapping System
The application will distinguish user personas based on a combination of the `UserRole` enum and specific account attributes.

| Persona | Internal Role (`UserRole`) | Condition / Attribute | Description |
| :--- | :--- | :--- | :--- |
| **Space Cadet** | `USER` | `createdAt` timestamp is within the last 1 hour | Newly registered users who are still in the onboarding phase. |
| **Star Explorer** | `USER` | `subscriptionExpires` is `NULL` or in the past | Standard users with free access. |
| **Galactic Patron** | `USER` | `subscriptionExpires` > `NOW()` | Premium users with active subscriptions. |
| **Starfleet Captain** | `MENTOR` | `role` = `MENTOR` | Educators and mentors. Linked to `Mentor` profile model. |
| **Mission Control** | `SUPERADMIN` | `role` = `SUPERADMIN` | System administrators with full access. |

### Implementation Note
- **Space Cadet Check**: Implement a helper function `isNewUser(user: User): boolean` in the frontend/backend utilities to check `Date.now() - user.createdAt.getTime() < 3600000`.
- **Premium Check**: Ensure all "Pro" feature gates check `user.subscriptionExpires > new Date()`.

## 3. School & Cohort Management
We will leverage the existing `schoolCode` field on the `User` model to organize students into cohorts.

- **Data Field**: `User.schoolCode` (String, nullable).
- **Usage**:
  - **Registration**: Users can enter a `schoolCode` during sign-up, or it can be assigned via bulk import.
  - **Filtering**: The Admin Dashboard user list will support filtering by `schoolCode`.
  - **Analytics**: Aggregated queries (e.g., average scores) will be grouped by `schoolCode`.
- **Validation**: Optionally maintain a list of valid school codes in a config file or a simple `School` table if stricter validation is required in the future. For now, strictly string matching is sufficient.

## 4. Mentor Specialization
To assign mentors to specific categories (e.g., "Physics", "Math"), we recommend a minor schema enhancement or a manual process.

### Recommended Approach: JSON Field
Add a `specialties` field to the `Mentor` model to store an array of tags.

**Schema Change:**
```prisma
model Mentor {
  // ... existing fields
  specialties Json?  // Example: ["Math", "Physics", "Grade 10"]
  // New Relation:
  teachingCourses   CourseMentor[]
}

model CourseMentor {
  id        String   @id @default(cuid())
  courseId  String
  mentorId  String
  assignedAt DateTime @default(now())

  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  mentor    Mentor   @relation(fields: [mentorId], references: [id], onDelete: Cascade)

  @@unique([courseId, mentorId])
  @@map("course_mentors")
}
```

### 4.1 Lesson Discussion System
To facilitate social learning, a threaded comment system is attached to each `CourseSection`.

**Schema Addition:**
```prisma
model LessonComment {
  id          String    @id @default(cuid())
  sectionId   String
  userId      String
  content     String
  parentId    String?   // For nested replies
  createdAt   DateTime  @default(now())
  
  section     CourseSection @relation(...)
  user        User          @relation(...)
  replies     LessonComment[] @relation("CommentReplies")
  
  @@map("lesson_comments")
}
```

### Alternative (No Schema Change)
Use the existing `bio` field to store keywords and perform text search, or manage assignments strictly via the `Course` relation (Mentors are assigned to Courses, which have Categories).

## 5. Bulk Operations

### User Import
A script (`scripts/bulk-import-users.ts`) will handle onboarding large cohorts.
- **Input**: CSV file with columns: `email,name,password,schoolCode,phone`.
- **Process**: 
  1. Parse CSV.
  2. Hash passwords using `bcryptjs`.
  3. Use `prisma.user.createMany` for performance.
  4. Log successes and failures.

### Voucher Generation
A script (`scripts/generate-school-coupons.ts`) will generate school-specific access codes.
- **Logic**: Generate random alphanumeric strings prefixed with the school identifier (e.g., `SMAN1-8X92`).
- **Storage**: Save to the `Voucher` table.
- **Distribution**: Output codes to a file for distribution to school administrators.
