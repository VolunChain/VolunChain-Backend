import { NextFunction, Request, Response } from "express";
import { CustomError, InternalServerError } from "../errors";
import { createLogger } from "../modules/shared/application/services/LoggerService";

const logger = createLogger("ERROR_HANDLER");

interface ErrorLogInfo {
  timestamp: string;
  path: string;
  method: string;
  error: string;
  stack?: string;
  requestBody?: unknown;
  requestQuery?: unknown;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error information
  const errorInfo: ErrorLogInfo = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: err.message,
  };

  // In development, include more details
  if (process.env.NODE_ENV === "development") {
    errorInfo.stack = err.stack;
    errorInfo.requestBody = req.body;
    errorInfo.requestQuery = req.query;
  }

  // Log error with Winston including trace ID and context
  logger.error("Unhandled error occurred", err, req, {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    errorType: err.constructor.name,
  });

  // Handle different types of errors
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
      ...(req.traceId && { traceId: req.traceId }),
    });
  }

  // For unknown errors, convert to InternalServerError
  const internalError = new InternalServerError(
    err.message || "An unexpected error occurred"
  );

  return res.status(internalError.statusCode).json({
    ...internalError.toJSON(),
    ...(req.traceId && { traceId: req.traceId }),
  });
};
