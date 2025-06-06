import { Request } from 'express';

/**
 * Unified user interface for authentication
 * This interface combines all user properties needed across the application
 */
export interface AuthenticatedUser {
  id: string | number;
  email: string;
  role: string;
  isVerified: boolean;
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
  id: string | number;
  email: string;
  role?: string;
  isVerified?: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Type guard to check if user has required authentication properties
 */
export function isAuthenticatedUser(user: any): user is AuthenticatedUser {
  return user && 
         (typeof user.id === 'string' || typeof user.id === 'number') &&
         typeof user.email === 'string' &&
         typeof user.role === 'string' &&
         typeof user.isVerified === 'boolean';
}

/**
 * Helper function to convert DecodedUser to AuthenticatedUser
 */
export function toAuthenticatedUser(decodedUser: DecodedUser): AuthenticatedUser {
  return {
    id: decodedUser.id,
    email: decodedUser.email,
    role: decodedUser.role || 'user',
    isVerified: decodedUser.isVerified || false
  };
}
