# User Module

This module follows the Domain-Driven Design (DDD) architecture pattern with clean separation of concerns.

## Architecture

```
src/modules/user/
├── domain/
│   ├── entities/          # Domain entities (User.ts)
│   ├── interfaces/        # Repository interfaces (IUserRepository.ts)
│   └── dto/              # Data Transfer Objects (UserDTO.ts)
├── infrastructure/
│   └── repositories/
│       └── implementations/
│           └── user-prisma.repository.ts  # Prisma implementation
├── presentation/
│   └── controllers/       # HTTP controllers (UserController.ts)
├── use-cases/             # Business logic (userUseCase.ts)
└── dto/                   # Request/Response DTOs
    ├── CreateUserDto.ts
    └── UpdateUserDto.ts
```

## Repository Pattern

- **IUserRepository**: Interface defining all user data operations
- **UserPrismaRepository**: Prisma-backed implementation (only file that touches Prisma)
- **Error Mapping**: Prisma errors are mapped to domain exceptions:
  - P2002 → ResourceConflictError (409)
  - P2025 → ResourceNotFoundError (404)
  - Validation errors → ValidationError (400)

## Dependencies

- Controllers and use-cases depend on `IUserRepository` interface
- Repository is injected via DI container (`USER_REPOSITORY` token)
- No direct Prisma imports outside the infrastructure layer

## Database Model

Uses the `User` model from Prisma schema (not the legacy `users` table):
- `id`, `name`, `lastName`, `email`, `password`, `wallet`
- `isVerified`, `verificationToken`, `verificationTokenExpires`
- `createdAt`, `updatedAt` timestamps

## Testing

- **Unit Tests**: Repository implementation with mocked Prisma
- **Integration Tests**: Controller endpoints with mocked repository
- **Error Handling**: Tests cover all error mapping scenarios
