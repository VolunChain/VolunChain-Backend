import { Request } from "express";
import { logger as winstonLogger } from "../../../../config/winston.config";
import { getTraceId } from "../../../../middlewares/traceId.middleware";

export interface LogContext {
  traceId?: string;
  context?: string;
  userId?: string;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface LogMeta {
  [key: string]: any;
}

/**
 * Enhanced Logger Service using Winston
 * Provides structured logging with trace ID support and context information
 * Follows Domain-Driven Design principles
 */
export class LoggerService {
  private context: string;

  constructor(context: string = "SYSTEM") {
    this.context = context;
  }

  /**
   * Create log context from Express request
   */
  private createRequestContext(req?: Request): LogContext {
    if (!req) {
      return { context: this.context };
    }

    return {
      traceId: getTraceId(req),
      context: this.context,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: (req as any).user?.id?.toString(),
    };
  }

  /**
   * Create log metadata object
   */
  private createLogMeta(context: LogContext, meta?: LogMeta): object {
    return {
      ...context,
      ...(meta && { meta }),
    };
  }

  /**
   * Log info level message
   */
  info(message: string, req?: Request, meta?: LogMeta): void {
    const context = this.createRequestContext(req);
    const logMeta = this.createLogMeta(context, meta);

    winstonLogger.info(message, logMeta);
  }

  /**
   * Log warning level message
   */
  warn(message: string, req?: Request, meta?: LogMeta): void {
    const context = this.createRequestContext(req);
    const logMeta = this.createLogMeta(context, meta);

    winstonLogger.warn(message, logMeta);
  }

  /**
   * Log error level message
   */
  error(
    message: string,
    error?: Error | any,
    req?: Request,
    meta?: LogMeta
  ): void {
    const context = this.createRequestContext(req);
    const logMeta = this.createLogMeta(context, {
      ...meta,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
          ...(error.code && { code: error.code }),
          ...(error.statusCode && { statusCode: error.statusCode }),
        },
      }),
    });

    winstonLogger.error(message, logMeta);
  }

  /**
   * Log debug level message
   */
  debug(message: string, req?: Request, meta?: LogMeta): void {
    const context = this.createRequestContext(req);
    const logMeta = this.createLogMeta(context, meta);

    winstonLogger.debug(message, logMeta);
  }

  /**
   * Log HTTP request
   */
  logRequest(req: Request, meta?: LogMeta): void {
    const context = this.createRequestContext(req);
    const logMeta = this.createLogMeta(context, {
      ...meta,
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: this.sanitizeBody(req.body),
    });

    winstonLogger.info("Incoming HTTP Request", logMeta);
  }

  /**
   * Log HTTP response
   */
  logResponse(
    req: Request,
    statusCode: number,
    responseTime?: number,
    meta?: LogMeta
  ): void {
    const context = this.createRequestContext(req);
    const logMeta = this.createLogMeta(context, {
      ...meta,
      statusCode,
      ...(responseTime && { responseTime: `${responseTime}ms` }),
    });

    const level = statusCode >= 400 ? "warn" : "info";
    winstonLogger[level]("HTTP Response", logMeta);
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== "object") {
      return body;
    }

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: string): LoggerService {
    return new LoggerService(`${this.context}:${additionalContext}`);
  }
}

// Export singleton instance for global use
export const globalLogger = new LoggerService("GLOBAL");

// Export factory function for creating context-specific loggers
export const createLogger = (context: string): LoggerService => {
  return new LoggerService(context);
};
