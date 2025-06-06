import winston from 'winston';
import path from 'path';

const { combine, timestamp, errors, json, printf } = winston.format;

// Custom format for console output in development
const consoleFormat = printf(({ level, message, timestamp, traceId, context, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `${timestamp} [${level.toUpperCase()}] [${traceId || 'NO-TRACE'}] [${context || 'SYSTEM'}]: ${message} ${metaStr}`;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

const createLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  const transports: winston.transport[] = [];

  // Console transport for development
  if (isDevelopment) {
    transports.push(
      new winston.transports.Console({
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          consoleFormat
        ),
        level: 'debug'
      })
    );
  }

  // File transports for all environments
  transports.push(
    // Combined logs (all levels)
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
      ),
      level: 'info',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),

    // Error logs only
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
      ),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );

  // Console transport for production (JSON format)
  if (isProduction) {
    transports.push(
      new winston.transports.Console({
        format: combine(
          timestamp(),
          errors({ stack: true }),
          json()
        ),
        level: 'info'
      })
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    format: combine(
      timestamp(),
      errors({ stack: true }),
      json()
    ),
    transports,
    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
      new winston.transports.File({
        filename: path.join(logsDir, 'exceptions.log'),
        format: combine(
          timestamp(),
          errors({ stack: true }),
          json()
        )
      })
    ],
    rejectionHandlers: [
      new winston.transports.File({
        filename: path.join(logsDir, 'rejections.log'),
        format: combine(
          timestamp(),
          errors({ stack: true }),
          json()
        )
      })
    ]
  });
};

export const logger = createLogger();

// Export logger configuration for testing
export { createLogger };
