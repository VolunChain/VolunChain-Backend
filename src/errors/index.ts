export class CustomError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("DATABASE_ERROR", message, 500, details);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("AUTHENTICATION_ERROR", message, 401, details);
  }
}
