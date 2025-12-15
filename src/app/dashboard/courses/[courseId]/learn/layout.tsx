import { ReactNode } from "react";
import CourseLearningLayoutClient from "./components/CourseLearningLayoutClient";

export default async function CourseLearningLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  // Extract the courseId from params
  const { courseId } = await params;
  
  // Pass the courseId as props to the client component
  // The client component will handle fetching session and enrollments
  return (
    <CourseLearningLayoutClient 
      children={children} 
      courseId={courseId}
    />
  );
}