# AuthProvider Component

The `AuthProvider` component wraps your application with NextAuth's `SessionProvider` to enable authentication context throughout your application.

## Usage

The `AuthProvider` is already integrated into the root layout (`src/app/layout.tsx`) so all pages in your application have access to authentication context.

```tsx
import { AuthProvider } from '@/components/providers/auth-provider'

export default function MyApp({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
```

## Features

- Provides session context to the entire application
- Includes smooth session refresh with configurable intervals
- Handles window focus detection for session updates
- Works seamlessly with Next.js App Router

## Accessing Session Data

To access session data in client components, use the `useSession` hook:

```tsx
'use client'

import { useSession } from 'next-auth/react'

export default function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') {
    return <p>Loading...</p>
  }
  
  if (session) {
    return <p>Signed in as {session.user?.email}</p>
  }
  
  return <p>Not signed in</p>
}
```