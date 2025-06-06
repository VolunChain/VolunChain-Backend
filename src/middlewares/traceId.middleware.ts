import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Note: traceId is already declared in auth.types.ts global interface

/**
 * Middleware to generate and attach a unique trace ID to each request
 * This trace ID will be used for logging correlation across the request lifecycle
 */
export const traceIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Generate a unique trace ID for this request
  const traceId = uuidv4();
  
  // Attach trace ID to the request object
  req.traceId = traceId;
  
  // Add trace ID to response headers for client-side correlation
  res.setHeader('X-Trace-ID', traceId);
  
  // Continue to next middleware
  next();
};

/**
 * Utility function to get trace ID from request
 * Returns the trace ID if available, otherwise returns a default value
 */
export const getTraceId = (req: Request): string => {
  return req.traceId || 'NO-TRACE-ID';
};

/**
 * Utility function to create a trace context object
 * This can be used when logging to include trace information
 */
export const createTraceContext = (req: Request, additionalContext?: Record<string, any>) => {
  return {
    traceId: getTraceId(req),
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    ...additionalContext
  };
};
