import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error({
    timestamp: new Date().toISOString(),
    error: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }
};
