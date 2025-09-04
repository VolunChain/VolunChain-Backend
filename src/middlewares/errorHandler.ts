import { NextFunction, Request, Response } from "express";
import {
  CustomError,
  InternalServerError,
} from "../modules/shared/application/errors";
import { Logger } from "../utils";

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

  // Handle different types of errors
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({
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

  res.status(internalError.statusCode).json({
    ...internalError.toJSON(),
    ...(req.traceId && { traceId: req.traceId }),
  });
  next();
};
