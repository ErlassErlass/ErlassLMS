// app/dashboard/courses/[courseId]/learn/[sectionId]/quiz/take/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";
import { QuizService } from "@/lib/services/quiz-service";
import { Play, CheckCircle, Clock, RotateCcw } from "lucide-react";
import Link from "next/link";

interface QuizTakePageProps {
  params: Promise<{
    courseId: string;
    sectionId: string;
  }>;
}

export default function QuizTakePage({ params }: QuizTakePageProps) {
  const { courseId, sectionId } = React.use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      if (!userId) return;
      
      try {
        const quizData = await QuizService.getQuizBySection(sectionId);
        if (quizData) {
          setQuiz(quizData);
          
          // Start quiz attempt
          const attempt = await QuizService.startQuizAttempt(quizData.id, userId);
          setAttemptId(attempt.id);
          
          // Set timer based on quiz duration
          if (quizData.duration) {
            setTimeRemaining(quizData.duration * 60); // Convert minutes to seconds
          } else {
            setTimeRemaining(30 * 60); // Default 30 minutes if no duration
          }
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        router.push(`/dashboard/courses/${courseId}/learn/${sectionId}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [sectionId, userId, courseId, router]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuizSubmit = async () => {
    if (!attemptId || !userId) return;

    try {
      // Calculate time spent
      const totalTime = quiz?.duration ? quiz.duration * 60 : 30 * 60; // in seconds
      const timeSpent = totalTime - timeRemaining;

      // Submit answers
      const result = await QuizService.submitQuizAttempt(attemptId, answers, timeSpent);
      setScore(result.score);
      setQuizCompleted(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const handleRestartQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setScore(null);
    
    // Restart quiz
    if (userId && quiz) {
      QuizService.startQuizAttempt(quiz.id, userId).then(attempt => {
        setAttemptId(attempt.id);
        setQuizStarted(true);
        setTimeRemaining(quiz.duration ? quiz.duration * 60 : 30 * 60);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat kuis...</p>
        </div>
      </div>
    );
  }

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

  if (quizCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Quiz Selesai!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Skor Anda</h3>
            <div className="text-4xl font-bold text-green-600 mb-6">{score}%</div>
            
            <p className="text-gray-600 mb-2">
              {(score || 0) >= 80 ? (
                <span className="text-green-600">Selamat! Anda telah menyelesaikan kuis dengan baik.</span>
              ) : (
                <span className="text-orange-600">Anda perlu mencapai skor 80% untuk melanjutkan.</span>
              )}
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleRestartQuiz} className="flex items-center">
                <RotateCcw className="h-4 w-4 mr-2" />
                Ulang Kuis
              </Button>
              <Link href={`/dashboard/courses/${courseId}/learn/${sectionId}`}>
                <Button variant="outline">
                  {(score || 0) >= 80 ? 'Selesaikan Section' : 'Kembali ke Materi'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizStarted) {
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
                    {quiz.duration ? `${quiz.duration} min` : 'Tidak terbatas'}
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full py-6 text-lg"
              onClick={() => setQuizStarted(true)}
            >
              <Play className="h-5 w-5 mr-2" />
              Mulai Kuis
            </Button>
            
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

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{currentQuestionIndex + 1} dari {quiz.questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestionIndex + 1}. {currentQuestion.question.questionText}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={answers[currentQuestion.question.id] || ""} 
            onValueChange={(value) => handleAnswerChange(currentQuestion.question.id, value)}
          >
            {currentQuestion.question.options.map((option: any, idx: number) => (
              <div key={option.id} className="flex items-center space-x-2 p-3 hover:bg-gray-50 rounded-lg">
                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="cursor-pointer flex-1">
                  {option.optionText}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Sebelumnya
            </Button>
            
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={handleQuizSubmit}>
                Submit Kuis
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Selanjutnya
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}