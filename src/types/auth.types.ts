import { Request } from "express";

/**
 * Unified Authentication Types
 *
 * This file consolidates all authentication-related type definitions
 * to prevent conflicts and ensure consistency across the application.
 */

/**
 * Unified user interface for authentication
 * This interface combines all user properties needed across the application
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  profileType: "user" | "organization";
}

/**
 * Unified authenticated request interface
 * Extends Express Request with user and traceId properties
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  traceId?: string;
}

/**
 * Decoded JWT user interface (from auth middleware)
 */
export interface DecodedUser {
  userId: string;
  email: string;
  profileType: "user" | "organization";
  iat?: number;
  exp?: number;
}

// Legacy user interface for backward compatibility
export interface LegacyUser {
  userId: string;
  profileType: "user" | "organization";
  email: string;
}

/**
 * Type guard to check if user has required authentication properties
 */
export function isAuthenticatedUser(user: unknown): user is AuthenticatedUser {
  return (
    user !== null &&
    typeof user === "object" &&
    "userId" in user &&
    "email" in user &&
    "profileType" in user &&
    typeof (user as Record<string, unknown>).userId === "string" &&
    typeof (user as Record<string, unknown>).email === "string" &&
    ((user as Record<string, unknown>).profileType === "user" ||
      (user as Record<string, unknown>).profileType === "organization")
  );
}

/**
 * Helper function to convert DecodedUser to AuthenticatedUser
 */
export function toAuthenticatedUser(
  decodedUser: DecodedUser
): AuthenticatedUser {
  return {
    userId: decodedUser.userId,
    email: decodedUser.email,
    profileType: decodedUser.profileType,
  };
}

/**
 * Helper function to convert AuthenticatedUser to LegacyUser for backward compatibility
 */
export const toLegacyUser = (user: AuthenticatedUser): LegacyUser => ({
  userId: user.userId,
  profileType: user.profileType,
  email: user.email,
});

// Global Express interface extension
declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
    traceId?: string;
  }
}
