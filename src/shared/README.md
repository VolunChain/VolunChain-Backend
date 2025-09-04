# Shared Module

## Overview

The `shared` directory contains common utilities, components, and functionality that are used across multiple modules in the VolunChain application. This module promotes code reusability, maintainability, and consistent implementation patterns throughout the application.

## Directory Structure

```
├── README.md
├── dto/
│   └── base.dto.ts         # Base Data Transfer Object classes
├── exceptions/
│   ├── AppException.ts     # Base exception class and common constants
│   └── DomainExceptions.ts # Domain-specific exception classes
├── infrastructure/
│   └── utils/
│       └── qrGenerator.ts  # QR code generation utility
└── middleware/
    ├── __tests__/
    │   └── validation.middleware.test.ts
    ├── errorHandler.ts     # Global error handling middleware
    └── validation.middleware.ts # Request validation middleware
```

## Modules

### DTO (Data Transfer Objects)

The `dto` directory contains base classes for data transfer objects used throughout the application.

- `base.dto.ts` - Provides common DTO classes including:
  - `UuidParamsDto` - For validating UUID parameters
  - `PaginationQueryDto` - For handling pagination parameters
  - `BaseResponseDto` - Standard response structure
  - `ErrorResponseDto` - Standard error response structure

#### Usage

```typescript
import { PaginationQueryDto } from "@shared/dto/base.dto";

// In your controller
export class ProjectController {
  @Get()
  async getProjects(@Query() query: PaginationQueryDto) {
    // query.page, query.limit, and query.search are validated
    // ...
  }
}
```

### Exceptions

The exceptions directory contains the centralized error handling system for the VolunChain application. The system provides a consistent way to handle and format errors across the application.

- `AppException.ts` - Base exception class and common constants
- `DomainExceptions.ts` - Domain-specific exception classes
- `errorHandler.ts` - Modules Error handler

#### Throwing Errors

```typescript
// In your controllers/services
import {
  ValidationException,
  NotFoundException,
} from "@shared/exceptions/DomainExceptions";

function updateUser(id: string, data: UserUpdateDto) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  if (!isValid(data)) {
    throw new ValidationException("Invalid user data", {
      invalidFields: ["email", "name"],
    });
  }
  // ...
}
```

#### Error Response Format

All errors are returned in the following format:

```json
{
  "statusCode": 400,
  "message": "Invalid user data",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "invalidFields": ["email", "name"]
  }
}
```

#### Available Exception Classes

1. `ValidationException` (400)

   - For invalid input data
   - Include details about validation failures

2. `AuthenticationException` (401)

   - For authentication failures
   - Use when user is not authenticated

3. `AuthorizationException` (403)

   - For permission issues
   - Use when user lacks required permissions

4. `NotFoundException` (404)

   - For missing resources
   - Use when requested entity doesn't exist

5. `ConflictException` (409)

   - For resource conflicts
   - Use for unique constraint violations

6. `InternalServerException` (500)
   - For unexpected server errors
   - Use as a last resort

### Infrastructure

The `infrastructure` directory contains utilities and services that interact with external systems or provide core functionality.

- `utils/qrGenerator.ts` - Utility for generating QR codes

#### Usage

```typescript
import { generateQRCode } from "@shared/infrastructure/utils/qrGenerator";

async function createCertificateQR(certificateId: string) {
  const url = `https://volunchain.org/verify/${certificateId}`;
  const qrBuffer = await generateQRCode(url);
  // Use the QR code buffer...
}
```

### Middleware

The `middleware` directory contains Express middleware functions used throughout the application.

- `errorHandler.ts` - Global error handling middleware
- `validation.middleware.ts` - Request validation middleware using class-validator

#### Validation Middleware Usage

```typescript
import { validateDto } from "@shared/middleware/validation.middleware";
import { CreateUserDto } from "./dto/create-user.dto";

// In your routes file
router.post("/users", validateDto(CreateUserDto), userController.create);
```

## Best Practices

1. Always use the most specific exception class available
2. Include meaningful error messages
3. Add relevant details when available
4. Don't expose sensitive information in error messages
5. Log errors appropriately before throwing
6. Use DTOs for request validation and response formatting
7. Keep shared utilities focused and well-tested

## Development Mode

In development mode, additional information is included in the error response:

- Stack trace
- Request body
- Request query parameters

## Testing

Run the test suite:

```bash
npm test -- --grep "shared"
```

## Contributing

When adding new shared components:

1. Ensure they are truly reusable across multiple modules
2. Add appropriate tests
3. Update this documentation
4. Follow the established patterns and naming conventions
