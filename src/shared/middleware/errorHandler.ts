import { Request, Response, NextFunction } from "express";
import { AppException } from "../exceptions/AppException";
import { InternalServerException } from "../exceptions/DomainExceptions";
import { Logger } from "../../utils/logger";

const logger = new Logger("ERROR_HANDLER");

interface ErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  details?: unknown;
  traceId?: string;
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Extract traceId from request if available
  const traceId = (req as any).traceId;

  let response: ErrorResponse;

  if (error instanceof AppException) {
    // If it's our custom exception, use its properties
    response = error.toJSON();
  } else {
    // For unknown errors, convert to InternalServerException
    const internalError = new InternalServerException(
      error.message || "An unexpected error occurred"
    );
    response = internalError.toJSON();
  }

  // Add traceId if available
  if (traceId) {
    response.traceId = traceId;
  }

  // Log the error with context
  logger.error("Unhandled error occurred", {
    errorCode: response.errorCode,
    status: response.statusCode,
    message: response.message,
    traceId,
    path: req.path,
    method: req.method,
    stack: error.stack,
  });

  res.status(response.statusCode).json(response);
}
