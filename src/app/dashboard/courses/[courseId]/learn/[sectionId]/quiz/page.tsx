// app/dashboard/courses/[courseId]/learn/[sectionId]/quiz/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { QuizService } from "@/lib/services/quiz-service";
import { ProgressService } from "@/lib/services/progress-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, CheckCircle, Clock, RotateCcw } from "lucide-react";
import Link from "next/link";

interface QuizPageProps {
  params: Promise<{
    courseId: string;
    sectionId: string;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { courseId, sectionId } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  
  if (!session || !userId) {
    redirect('/auth/signin');
  }
  
  // Get quiz data
  let quiz = null;
  try {
    quiz = await QuizService.getQuizBySection(sectionId);
    if (!quiz) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Kuis tidak ditemukan</h2>
            <p className="text-gray-600 mb-4">Tidak ada kuis tersedia untuk section ini</p>
            <Link href={`/dashboard/courses/${courseId}/learn/${sectionId}`}>
              <Button variant="outline">Kembali ke Materi</Button>
            </Link>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error("Error loading quiz:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Terjadi kesalahan</h2>
          <p className="text-gray-600 mb-4">Gagal memuat kuis</p>
          <Link href={`/dashboard/courses/${courseId}/learn/${sectionId}`}>
            <Button variant="outline">Kembali</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Start a new attempt
  let attempt = null;
  try {
    attempt = await QuizService.startQuizAttempt(quiz.id, userId);
  } catch (error) {
    console.error("Error starting quiz:", error);
    // If max attempts exceeded, redirect to section
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Batas Percobaan Terlampaui</h2>
          <p className="text-gray-600 mb-4">Anda telah mencapai maksimal percobaan untuk kuis ini.</p>
          <Link href={`/dashboard/courses/${courseId}/learn/${sectionId}`}>
            <Button variant="outline">Kembali ke Materi</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mulai Kuis: {quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-gray-600 mb-2">{quiz.description || 'Kuis untuk menguji pemahaman materi section ini.'}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Jumlah Soal</div>
                <div className="text-2xl font-bold text-blue-800">{quiz.questions.length}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Durasi</div>
                <div className="text-2xl font-bold text-purple-800">
                  {quiz.duration ? `${quiz.duration} menit` : 'Tidak terbatas'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Form to start the quiz */}
          <form action={async () => {
            'use server';
            // This would redirect to the actual quiz taking page
            redirect(`/dashboard/courses/${courseId}/learn/${sectionId}/quiz/take`);
          }}>
            <Button type="submit" className="w-full py-6 text-lg">
              <Play className="h-5 w-5 mr-2" />
              Mulai Kuis
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href={`/dashboard/courses/${courseId}/learn/${sectionId}`}>
              <Button variant="link">Kembali ke Materi</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}