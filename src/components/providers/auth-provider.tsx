"use client";

import { SessionProvider, SessionProviderProps } from "next-auth/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
} & Pick<SessionProviderProps, 'refetchInterval' | 'refetchOnWindowFocus'>;

export function AuthProvider({ 
  children,
  refetchInterval = 5 * 60, // Default to 5 minutes
  refetchOnWindowFocus = true
}: Props) {
  return (
    <SessionProvider 
      // Adding a smooth loading experience for session initialization
      refetchInterval={refetchInterval} 
      refetchOnWindowFocus={refetchOnWindowFocus} 
    >
      {children}
    </SessionProvider>
  );
}