import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors";
import { createLogger } from "../services/logger.service";

const logger = createLogger('ERROR_HANDLER');

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log error with Winston including trace ID and context
    logger.error(
        'Unhandled error occurred',
        err,
        req,
        {
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString(),
            errorType: err.constructor.name
        }
    );

    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            code: err.code,
            message: err.message,
            ...(err.details && { details: err.details }),
            ...(req.traceId && { traceId: req.traceId })
        });
    }

    // Handle unexpected errors
    return res.status(500).json({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        ...(req.traceId && { traceId: req.traceId })
    });
}