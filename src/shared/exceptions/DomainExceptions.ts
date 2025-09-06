import { AppException, HttpStatus, ErrorCodes } from "./AppException";

export class ValidationException extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR, details);
  }
}

export class AuthenticationException extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCodes.AUTHENTICATION_ERROR, details);
  }
}

export class AuthorizationException extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.FORBIDDEN, ErrorCodes.AUTHORIZATION_ERROR, details);
  }
}

export class NotFoundException extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.NOT_FOUND, ErrorCodes.RESOURCE_NOT_FOUND, details);
  }
}

export class ConflictException extends AppException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.CONFLICT, ErrorCodes.RESOURCE_CONFLICT, details);
  }
}

export class InternalServerException extends AppException {
  constructor(message: string = "Internal server error", details?: unknown) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.INTERNAL_ERROR, details);
  }
}
