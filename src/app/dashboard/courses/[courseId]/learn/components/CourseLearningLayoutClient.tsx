"use client";

import { useSession } from "next-auth/react";
import { getUserEnrollments } from "@/lib/course-service";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Home, User } from "lucide-react";

interface CourseLearningLayoutClientProps {
  children: React.ReactNode;
  courseId: string;
}

export default function CourseLearningLayoutClient({ 
  children, 
  courseId 
}: CourseLearningLayoutClientProps) {
  const { data: session } = useSession();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (session?.user?.id) {
        try {
          const userEnrollments = await getUserEnrollments(session.user.id);
          setEnrollments(userEnrollments);
        } catch (error) {
          console.error("Error fetching enrollments:", error);
        }
      }
    };
    
    fetchEnrollments();
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <BookOpen className="h-8 w-8 text-erlass-primary" />
                <span className="ml-2 text-xl font-bold text-[#040d1c]">Erlass</span>
              </Link>
            </div>
            
            <nav className="flex space-x-8">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-[#040d1c]/60 hover:border-gray-300 hover:text-[#040d1c]"
              >
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
              <Link 
                href={`/dashboard/courses/${courseId}`} 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-[#040d1c]/60 hover:border-gray-300 hover:text-[#040d1c]"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Kursus
              </Link>
              <Link 
                href="/dashboard/profile" 
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-[#040d1c]/60 hover:border-gray-300 hover:text-[#040d1c]"
              >
                <User className="h-4 w-4 mr-1" />
                Profil
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-md min-h-screen hidden md:block">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-[#040d1c] mb-4">Kursus Saya</h2>
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/dashboard/courses/${enrollment.courseId}`}
                  className={`block px-4 py-2 rounded-md text-sm font-medium ${
                    enrollment.courseId === courseId
                      ? "bg-erlass-primary text-white"
                      : "text-[#040d1c] hover:bg-gray-100"
                  }`}
                >
                  {enrollment.course.title}
                </Link>
              ))}
              
              {enrollments.length === 0 && (
                <p className="px-4 py-2 text-sm text-[#040d1c]/60">Belum ada kursus</p>
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-200">
              <Link 
                href="/dashboard/courses" 
                className="block px-4 py-2 text-sm font-medium text-[#040d1c] hover:bg-gray-100 rounded-md"
              >
                Jelajahi Kursus
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}