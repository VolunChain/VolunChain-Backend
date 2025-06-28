import { Request, Response, NextFunction } from "express";
import { createLogger } from "../modules/shared/application/services/LoggerService";

const logger = createLogger("REQUEST_LOGGER");

/**
 * Middleware for logging HTTP requests and responses
 * Captures request details, response status, and response time
 */
export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log incoming request
  logger.logRequest(req, {
    timestamp: new Date().toISOString(),
    requestId: req.traceId,
  });

  // Override res.end to capture response details
  const originalEnd = res.end;

  res.end = function (chunk?: any, encoding?: any, cb?: any): any {
    const responseTime = Date.now() - startTime;

    // Log response
    logger.logResponse(req, res.statusCode, responseTime, {
      timestamp: new Date().toISOString(),
      requestId: req.traceId,
      contentLength: res.get("Content-Length"),
    });

    // Call original end method
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

/**
 * Middleware for logging only errors (lighter version)
 * Use this for high-traffic endpoints where full request logging might be too verbose
 */
export const errorOnlyLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Override res.end to capture only error responses
  const originalEnd = res.end;

  res.end = function (chunk?: any, encoding?: any, cb?: any): any {
    // Only log if status code indicates an error (4xx or 5xx)
    if (res.statusCode >= 400) {
      const responseTime = Date.now() - startTime;

      logger.logResponse(req, res.statusCode, responseTime, {
        timestamp: new Date().toISOString(),
        requestId: req.traceId,
        contentLength: res.get("Content-Length"),
        errorResponse: true,
      });
    }

    // Call original end method
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};
