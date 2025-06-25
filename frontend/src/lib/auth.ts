import { createAuthClient } from "better-auth/react";
import type { Session, User } from "better-auth/types";

export const authClient = createAuthClient({
  
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://your-production-domain.com" // Replace with your production URL
      : "http://localhost:3001", // Your backend server URL
});

export const { getSession, signIn, signOut, signUp } = authClient;

// Export types for use in components
export type { Session, User };
