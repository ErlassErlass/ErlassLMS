import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

// Extend the default session user type to include our custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

/**
 * Utility function to get the current session in server components
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  return session?.user;
}

/**
 * Utility function to check if user is authenticated in server components
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  
  return !!session?.user;
}

/**
 * Utility function to check user role in server components
 */
export async function hasRole(requiredRole: string) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;

  return userRole === requiredRole;
}