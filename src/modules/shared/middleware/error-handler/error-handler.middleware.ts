// shared/middleware/error-handler.middleware.ts
import { Request, Response, NextFunction } from "express";
import { DomainException } from "../../domain/exceptions/domain.exception";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof DomainException) {
    res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    errorCode: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
}
