import { Request } from 'express';

/**
 * Unified Authentication Types
 * 
 * This file consolidates all authentication-related type definitions
 * to prevent conflicts and ensure consistency across the application.
 */

// Base user interface from JWT token
export interface DecodedUser {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  iat?: number;
  exp?: number;
}

// Extended user interface with additional properties (alias for backward compatibility)
export interface AuthenticatedUser extends DecodedUser {
  // This is now the same as DecodedUser for consistency
}

// Legacy user interface for backward compatibility
export interface LegacyUser {
  id: number | string;
  role: string;
  isVerified?: boolean;
  email?: string;
}

// Request interface with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: DecodedUser;
}

// Type conversion utilities
export const toAuthenticatedUser = (user: Partial<DecodedUser>): DecodedUser => ({
  id: user.id || '',
  email: user.email || '',
  role: user.role || 'user',
  isVerified: user.isVerified || false,
  iat: user.iat,
  exp: user.exp
});

export const toLegacyUser = (user: DecodedUser): LegacyUser => ({
  id: user.id,
  role: user.role,
  isVerified: user.isVerified,
  email: user.email
});

// Global Express namespace extension
declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}
