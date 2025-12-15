import type { Metadata } from 'next'
import { ABeeZee } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ThemeProvider } from "@/components/theme-provider"
import KonamiListener from '@/components/layout/konami-listener'
import { Toaster } from "sonner"

const abeezee = ABeeZee({ 
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-abeezee',
})

export const metadata: Metadata = {
  title: 'Erlass Platform - Coding untuk Masa Depan',
  description: 'Platform pembelajaran coding dan robotik untuk siswa SD-SMP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${abeezee.variable} font-sans antialiased`}>
        <ThemeProvider
            attribute="class"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
          <AuthProvider>
            <KonamiListener />
            {children}
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
