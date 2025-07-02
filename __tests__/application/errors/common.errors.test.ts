import { describe, expect, it } from '@jest/globals';
import {
  CustomError,
  ValidationError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  ResourceNotFoundError,
  ResourceConflictError,
  InternalServerError,
  HttpStatus,
  ErrorCodes,
} from '../../../src/modules/shared/application/errors/common.errors';
import { DomainException } from '../../../src/modules/shared/domain/exceptions/domain.exception';

describe('HttpStatus Constants', () => {
  it('should have correct HTTP status codes', () => {
    expect(HttpStatus.BAD_REQUEST).toBe(400);
    expect(HttpStatus.UNAUTHORIZED).toBe(401);
    expect(HttpStatus.FORBIDDEN).toBe(403);
    expect(HttpStatus.NOT_FOUND).toBe(404);
    expect(HttpStatus.CONFLICT).toBe(409);
    expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
  });
});

describe('ErrorCodes Constants', () => {
  it('should have correct error codes', () => {
    expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCodes.DATABASE_ERROR).toBe('DATABASE_ERROR');
    expect(ErrorCodes.AUTHENTICATION_ERROR).toBe('AUTHENTICATION_ERROR');
    expect(ErrorCodes.AUTHORIZATION_ERROR).toBe('AUTHORIZATION_ERROR');
    expect(ErrorCodes.RESOURCE_NOT_FOUND).toBe('RESOURCE_NOT_FOUND');
    expect(ErrorCodes.RESOURCE_CONFLICT).toBe('RESOURCE_CONFLICT');
    expect(ErrorCodes.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
  });
});

describe('CustomError', () => {
  it('should create a custom error with all properties', () => {
    const code = 'TEST_ERROR';
    const message = 'Test error message';
    const statusCode = 400;
    const details = { field: 'test' };

    const error = new CustomError(code, message, statusCode, details);

    expect(error).toBeInstanceOf(DomainException);
    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.details).toEqual(details);
    expect(error.name).toBe('CustomError');
  });

  it('should create a custom error without details', () => {
    const code = 'TEST_ERROR';
    const message = 'Test error message';
    const statusCode = 400;

    const error = new CustomError(code, message, statusCode);

    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.details).toBeUndefined();
  });

  it('should serialize to JSON correctly', () => {
    const error = new CustomError('TEST_ERROR', 'Test message', 400, { field: 'test' });
    const json = error.toJSON();

    expect(json).toEqual({
      statusCode: 400,
      message: 'Test message',
      errorCode: 'TEST_ERROR',
      details: { field: 'test' }
    });
  });

  it('should serialize to JSON without details when not provided', () => {
    const error = new CustomError('TEST_ERROR', 'Test message', 400);
    const json = error.toJSON();

    expect(json).toEqual({
      statusCode: 400,
      message: 'Test message',
      errorCode: 'TEST_ERROR'
    });
  });
});

describe('ValidationError', () => {
  it('should create a validation error with correct properties', () => {
    const message = 'Validation failed';
    const details = { field: 'email', reason: 'invalid format' };

    const error = new ValidationError(message, details);

    expect(error).toBeInstanceOf(CustomError);
    expect(error).toBeInstanceOf(DomainException);
    expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(error.details).toEqual(details);
    expect(error.name).toBe('ValidationError');
  });

  it('should create a validation error without details', () => {
    const message = 'Validation failed';
    const error = new ValidationError(message);

    expect(error.message).toBe(message);
    expect(error.details).toBeUndefined();
  });
});

describe('DatabaseError', () => {
  it('should create a database error with correct properties', () => {
    const message = 'Database connection failed';
    const details = { connectionString: 'redacted' };

    const error = new DatabaseError(message, details);

    expect(error).toBeInstanceOf(CustomError);
    expect(error.code).toBe(ErrorCodes.DATABASE_ERROR);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(error.details).toEqual(details);
  });
});

describe('AuthenticationError', () => {
  it('should create an authentication error with correct properties', () => {
    const message = 'Invalid credentials';

    const error = new AuthenticationError(message);

    expect(error).toBeInstanceOf(CustomError);
    expect(error.code).toBe(ErrorCodes.AUTHENTICATION_ERROR);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });
});

describe('AuthorizationError', () => {
  it('should create an authorization error with correct properties', () => {
    const message = 'Access denied';

    const error = new AuthorizationError(message);

    expect(error).toBeInstanceOf(CustomError);
    expect(error.code).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(HttpStatus.FORBIDDEN);
  });
});

describe('ResourceNotFoundError', () => {
  it('should create a resource not found error with correct properties', () => {
    const message = 'User not found';
    const details = { userId: '123' };

    const error = new ResourceNotFoundError(message, details);

    expect(error).toBeInstanceOf(CustomError);
    expect(error.code).toBe(ErrorCodes.RESOURCE_NOT_FOUND);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(error.details).toEqual(details);
  });
});

describe('ResourceConflictError', () => {
  it('should create a resource conflict error with correct properties', () => {
    const message = 'Email already exists';

    const error = new ResourceConflictError(message);

    expect(error).toBeInstanceOf(CustomError);
    expect(error.code).toBe(ErrorCodes.RESOURCE_CONFLICT);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(HttpStatus.CONFLICT);
  });
});

describe('InternalServerError', () => {
  it('should create an internal server error with default message', () => {
    const error = new InternalServerError();

    expect(error).toBeInstanceOf(CustomError);
    expect(error.code).toBe(ErrorCodes.INTERNAL_ERROR);
    expect(error.message).toBe('Internal server error');
    expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should create an internal server error with custom message', () => {
    const message = 'Something went wrong';
    const details = { trace: 'stack trace here' };

    const error = new InternalServerError(message, details);

    expect(error.message).toBe(message);
    expect(error.details).toEqual(details);
  });
});

describe('Error Inheritance and Type Checking', () => {
  it('should maintain proper inheritance chain', () => {
    const error = new ValidationError('Test validation error');

    expect(error instanceof ValidationError).toBe(true);
    expect(error instanceof CustomError).toBe(true);
    expect(error instanceof DomainException).toBe(true);
    expect(error instanceof Error).toBe(true);
  });

  it('should be distinguishable by type', () => {
    const validationError = new ValidationError('Validation failed');
    const databaseError = new DatabaseError('Database failed');

    expect(validationError instanceof ValidationError).toBe(true);
    expect(validationError instanceof DatabaseError).toBe(false);
    expect(databaseError instanceof DatabaseError).toBe(true);
    expect(databaseError instanceof ValidationError).toBe(false);
  });
});

describe('Error Simulation Tests', () => {
  it('should simulate validation error being thrown', async () => {
    const simulateValidationError = async () => {
      throw new ValidationError('Invalid input');
    };

    await expect(simulateValidationError()).rejects.toThrow(ValidationError);
    await expect(simulateValidationError()).rejects.toThrow('Invalid input');
  });

  it('should simulate database error being thrown', async () => {
    const simulateDatabaseError = async () => {
      throw new DatabaseError('Connection timeout');
    };

    await expect(simulateDatabaseError()).rejects.toThrow(DatabaseError);
    await expect(simulateDatabaseError()).rejects.toThrow('Connection timeout');
  });

  it('should simulate authentication error being thrown', async () => {
    const simulateAuthError = async () => {
      throw new AuthenticationError('Invalid token');
    };

    await expect(simulateAuthError()).rejects.toThrow(AuthenticationError);
    await expect(simulateAuthError()).rejects.toThrow('Invalid token');
  });
}); 