export interface RateLimitConfig {
  // Maximum number of requests allowed
  maxRequests: number;

  // Time window in minutes
  windowMinutes: number;

  // Different configurations for different route types
  routes: {
    auth: RateLimitOptions;
    wallet: RateLimitOptions;
    email: RateLimitOptions;
    default: RateLimitOptions;
  };
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMinutes: number;
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  windowMinutes: Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 5, // Global window
  routes: {
    auth: {
      maxRequests: Number(process.env.RATE_LIMIT_AUTH_MAX) || 10,
      windowMinutes: Number(process.env.RATE_LIMIT_AUTH_WINDOW) || 3, // Shorter window for auth
    },
    wallet: {
      maxRequests: Number(process.env.RATE_LIMIT_WALLET_MAX) || 50,
      windowMinutes: Number(process.env.RATE_LIMIT_WALLET_WINDOW) || 5,
    },
    email: {
      maxRequests: Number(process.env.RATE_LIMIT_EMAIL_MAX) || 20,
      windowMinutes: Number(process.env.RATE_LIMIT_EMAIL_WINDOW) || 5,
    },
    default: {
      maxRequests: Number(process.env.RATE_LIMIT_DEFAULT_MAX) || 100,
      windowMinutes: Number(process.env.RATE_LIMIT_DEFAULT_WINDOW) || 5,
    },
  },
};
