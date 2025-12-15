// lib/types/course-types.ts

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory = 'scratch' | 'pictoblox' | 'microbit' | 'python' | 'javascript' | 'ai' | 'robotics';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  price: number; // in Rupiah
  isPremium: boolean;
  freeSections: number;
  totalSections: number;
  coverImage?: string;
  isPublished: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations (when included)
  createdBy?: User;
  sections?: CourseSection[];
  enrollments?: Enrollment[];
}

export interface CourseSection {
  id: string;
  title: string;
  description?: string;
  content?: string; // HTML content atau markdown
  videoUrl?: string;
  orderIndex: number;
  isFree: boolean;
  estimatedDuration?: number; // dalam menit
  courseId: string;
  createdAt: Date;
  // Relations (when included)
  course?: Course;
  progress?: UserProgress[];
  quizzes?: Quiz[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  mentorId?: string;
  progressPercentage: number;
  currentSectionId?: string;
  completedAt?: Date;
  enrolledAt: Date;
  // Relations (when included)
  user?: User;
  course?: Course;
  mentor?: Mentor;
}

export interface UserProgress {
  id: string;
  userId: string;
  sectionId: string;
  courseId: string;
  completed: boolean;
  quizScore?: number;
  timeSpent?: number; // dalam detik
  completedAt?: Date;
  // Relations (when included)
  user?: User;
  section?: CourseSection;
  course?: Course;
}

// Sample interfaces for related models
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  // Include other user properties as needed
}

export interface Mentor {
  id: string;
  userId: string;
  bio?: string;
  hourlyRate?: number;
  rating?: number;
  isVerified: boolean;
  // Include other mentor properties as needed
}

export interface Quiz {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  // Include other quiz properties and relations as needed
}