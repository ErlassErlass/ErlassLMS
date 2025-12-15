"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  return (
    <SessionProvider 
      // Adding a smooth loading experience for session initialization
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch on window focus
    >
      {children}
    </SessionProvider>
  );
}