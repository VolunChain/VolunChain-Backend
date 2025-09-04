import { NextFunction, Request, Response } from "express";
import { AppException } from "../shared/exceptions/AppException";
import { Logger } from "../utils/logger";

const logger = new Logger("ERROR_HANDLER");

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

  // Log error with context including trace ID
  logger.error("Unhandled error occurred", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    errorType: err.constructor.name,
    traceId: req.traceId,
  });

  // Handle domain exceptions
  if (err instanceof AppException) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      errorCode: err.errorCode,
      ...(req.traceId && { traceId: req.traceId }),
    });
  }

  // For unknown errors, return generic 500 error
  return res.status(500).json({
    statusCode: 500,
    message: "Internal server error",
    errorCode: "INTERNAL_ERROR",
    ...(req.traceId && { traceId: req.traceId }),
  });
};
