import { DomainException } from "../../domain/exceptions/domain.exception";

// HTTP Status codes for different types of errors
export const HttpStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error codes for the application
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export class CustomError extends DomainException {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  public toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      errorCode: this.code,
      ...(this.details && { details: this.details }),
    };
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ErrorCodes.VALIDATION_ERROR,
      message,
      HttpStatus.BAD_REQUEST,
      details
    );
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ErrorCodes.DATABASE_ERROR,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      details
    );
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ErrorCodes.AUTHENTICATION_ERROR,
      message,
      HttpStatus.UNAUTHORIZED,
      details
    );
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ErrorCodes.AUTHORIZATION_ERROR,
      message,
      HttpStatus.FORBIDDEN,
      details
    );
  }
}

export class ResourceNotFoundError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ErrorCodes.RESOURCE_NOT_FOUND,
      message,
      HttpStatus.NOT_FOUND,
      details
    );
  }
}

export class ResourceConflictError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCodes.RESOURCE_CONFLICT, message, HttpStatus.CONFLICT, details);
  }
}

export class InternalServerError extends CustomError {
  constructor(
    message: string = "Internal server error",
    details?: Record<string, unknown>
  ) {
    super(
      ErrorCodes.INTERNAL_ERROR,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      details
    );
  }
} 