"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode; // What to render when user is not authenticated
};

/**
 * Component that only shows content to authenticated users
 */
export function Protected({ children, fallback = null }: Props) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "loading" || (session && session.user);

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}