import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { getCourse, getCourseSection } from "@/lib/course-service";
import { ProgressService } from "@/lib/services/progress-service";
import { QuizService } from "@/lib/services/quiz-service";
import { Play, CheckCircle, SquareArrowLeft, SquareArrowRight } from "lucide-react";
import Link from "next/link";

export default async function CourseLearningPage({ 
  params 
}: { 
  params: Promise<{ courseId: string, sectionId: string }> 
}) {
  const { courseId, sectionId } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  if (!session || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Silakan login terlebih dahulu</h2>
          <Link href="/auth/signin">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get course and section data
  const course = await getCourse(courseId);
  const section = await getCourseSection(sectionId);
  
  // Get course progress data using ProgressService
  const courseProgress = await ProgressService.getUserCourseProgress(userId, courseId);
  const currentSection = courseProgress?.sections.find((s: any) => s.id === sectionId);
  const userProgress = currentSection?.userProgress;
  
  // Check if there's a quiz for this section
  const quiz = await QuizService.getQuizBySection(sectionId);

  if (!course || !section) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Konten tidak ditemukan</h2>
          <Link href={`/dashboard/courses/${courseId}`}>
            <Button>Kembali ke Kursus</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Find current and next sections for navigation using courseProgress
  const currentSectionIndex = courseProgress?.sections.findIndex((s: any) => s.id === sectionId) ?? -1;
  const nextSection = courseProgress?.sections && currentSectionIndex < courseProgress?.sections.length - 1 
    ? courseProgress?.sections[currentSectionIndex + 1] 
    : null;
  const prevSection = courseProgress?.sections && currentSectionIndex > 0 
    ? courseProgress?.sections[currentSectionIndex - 1] 
    : null;

  // Handle marking section as complete using ProgressService
  const handleMarkComplete = async () => {
    "use server";
    
    try {
      await ProgressService.completeSection(userId, sectionId, courseId);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href={`/dashboard/courses/${courseId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <SquareArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke kursus
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h1>
            
            {/* Video Player */}
            {section.videoUrl && (
              <div className="mb-6">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative">
                  <Play className="h-16 w-16 text-white opacity-80" />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <Button className="bg-white text-gray-900 hover:bg-gray-100">
                      Putar Video
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className="prose prose-blue max-w-none">
              {section.content ? (
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              ) : (
                <p>Content for this section is coming soon. Please check back later.</p>
              )}
            </div>
            
            {/* Quiz Section */}
            {quiz && (
              <div className="mt-8">
                {(() => {
                  const { getServerSession } = require("next-auth");
                  const { authOptions } = require("@/lib/auth");
                  // Since we're in a server component, we need to handle this differently
                  // For now let's skip embedding the quiz component directly and keep the link
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                      <h3 className="font-semibold text-blue-800 mb-2">Kuis Section Tersedia</h3>
                      <p className="text-blue-600 mb-4">
                        Anda perlu menyelesaikan kuis untuk menandai section ini sebagai selesai.
                      </p>
                      <Link href={`/dashboard/courses/${courseId}/learn/${sectionId}/quiz/take`}>
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Kerjakan Kuis
                        </Button>
                      </Link>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              {/* Only show complete button if no quiz exists or if user has passed the quiz */}
              {!quiz ? (
                <form action={handleMarkComplete}>
                  <Button type="submit" variant={userProgress?.completed ? "default" : "secondary"}>
                    {userProgress?.completed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Selesai
                      </>
                    ) : (
                      'Tandai Selesai'
                    )}
                  </Button>
                </form>
              ) : (
                // Show a message that quiz must be completed first
                <div className="text-gray-500 italic">
                  Selesaikan kuis untuk menandai section ini sebagai selesai
                </div>
              )}
              
              {nextSection ? (
                <Link href={`/dashboard/courses/${courseId}/learn/${nextSection.id}`}>
                  <Button>
                    Lanjutkan
                    <SquareArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/dashboard/courses/${courseId}`}>
                  <Button variant="outline">
                    Selesaikan Kursus
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar - Course Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
            <h3 className="font-semibold mb-4">Kurikulum</h3>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {courseProgress?.sections?.map((s: any, index: number) => (
                <Link 
                  key={s.id} 
                  href={`/dashboard/courses/${courseId}/learn/${s.id}`}
                  className={`block p-3 rounded-lg border ${
                    s.id === sectionId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {s.isFree ? (
                        <Play className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${
                        s.id === sectionId ? 'font-medium text-blue-700' : 'text-gray-700'
                      }`}>
                        {index + 1}. {s.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {s.estimatedDuration} min
                      </div>
                    </div>
                    {s.userProgress?.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Navigation between sections */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                {prevSection ? (
                  <Link href={`/dashboard/courses/${courseId}/learn/${prevSection.id}`}>
                    <Button variant="outline" className="flex items-center">
                      <SquareArrowLeft className="h-4 w-4 mr-2" />
                      Sebelumnya
                    </Button>
                  </Link>
                ) : (
                  <div></div> // Empty div to maintain spacing
                )}
                
                {nextSection && (
                  <Link href={`/dashboard/courses/${courseId}/learn/${nextSection.id}`}>
                    <Button className="flex items-center">
                      Lanjutkan
                      <SquareArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}