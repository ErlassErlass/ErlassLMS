import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Cari user existing
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (user) {
          // Use bcrypt to compare passwords - check if user.password exists
          if (user.password) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              }
            }
          } else {
            // If user doesn't have a password (shouldn't happen with current schema), return null
            return null;
          }
        } else {
          // Auto-create user untuk MVP - with proper password hashing
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              password: hashedPassword,
              role: 'USER',
            }
          })
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        }
      }
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as any
        return {
          ...token,
          id: u.id,
          role: u.role,
        }
      }
      return token
    },
  },
}