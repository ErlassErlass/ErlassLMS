
import { User, Enrollment } from "@/generated/prisma"

export type UserPersona = 
  | 'Space Cadet'
  | 'Star Explorer'
  | 'Galactic Patron'
  | 'Starfleet Captain'
  | 'Mission Control'
  | 'Planet Guardian'

/**
 * Determines the Persona/Role of a user based on their data.
 * Moodle V2.0 Simulation Logic.
 */
export function getUserPersona(user: User & { enrollments?: Enrollment[] }): UserPersona {
  // 1. Mission Control (Superadmin)
  if (user.role === 'SUPERADMIN') return 'Mission Control'

  // 2. Starfleet Captain (Mentor)
  if (user.role === 'MENTOR') return 'Starfleet Captain'

  // 3. Space Cadet (New User < 1 Hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  if (user.createdAt > oneHourAgo && (!user.enrollments || user.enrollments.length === 0)) {
    return 'Space Cadet'
  }

  // 4. Galactic Patron (Active Premium Subscription)
  if (user.subscriptionExpires && user.subscriptionExpires > new Date()) {
    return 'Galactic Patron'
  }

  // 5. Star Explorer (Default Free User)
  return 'Star Explorer'
}

export const ROLE_BADGES: Record<UserPersona, string> = {
  'Space Cadet': '🚀',
  'Star Explorer': '👨‍🚀',
  'Galactic Patron': '💰',
  'Starfleet Captain': '🛰️',
  'Mission Control': '🌠',
  'Planet Guardian': '🪐'
}
