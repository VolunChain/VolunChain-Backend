# VolunChain Backend - Volunteer Module (DDD Refactor)

## 📌 Overview

This module implements the **Volunteer** domain using **Domain-Driven Design (DDD)** principles. It ensures proper separation of concerns and maintains a clean architecture. The repository layer is implemented using **Prisma ORM**, and the business logic is handled via use cases.

## 📂 Project Module Structure

```
modules/volunteer/
├── __tests__/                  # Unit tests
│   ├── domain/
│   │   ├── volunteer.entity.test.ts
│   ├── repositories/
│   │   ├── volunteer-prisma.repository.test.ts
│   ├── use-cases/
│   │   ├── create-volunteer.use-case.test.ts
│   │   ├── delete-volunteer.use-case.test.ts
│   │   ├── get-volunteers-by-project.use-case.test.ts
│   │   ├── update-volunteer.use-case.test.ts
│
├── domain/                     # Domain Layer
│   ├── volunteer.entity.ts      # Volunteer entity (domain model)
│   ├── volunteer.interface.ts   # Volunteer attribute interfaces
│
├── dto/                        # Data Transfer Objects
│   ├── volunteer.dto.ts         # DTOs for request/response handling
│
├── repositories/               # Repository Layer
│   ├── implementations/
│   │   ├── volunteer-prisma.repository.ts  # Prisma-based repository
│   ├── interfaces/
│   │   ├── volunteer-repository.interface.ts # Repository contract
│
├── use-cases/                  # Use Cases (Application Layer)
│   ├── create-volunteer.use-case.ts
│   ├── delete-volunteer.use-case.ts
│   ├── get-volunteers-by-project.use-case.ts
│   ├── update-volunteer.use-case.ts
```

## 🏛️ Domain-Driven Design (DDD) Implementation

### 1. **Domain Layer**

- **`volunteer.entity.ts`**: Implements the `Volunteer` entity with validation and business logic.
- **`volunteer.interface.ts`**: Defines attribute interfaces for strict type enforcement.

### 2. **Application Layer (Use Cases)**

- **Handles business logic independent of data storage.**
- Implements CRUD operations:
  - `CreateVolunteerUseCase`
  - `UpdateVolunteerUseCase`
  - `DeleteVolunteerUseCase`
  - `GetVolunteersByProjectUseCase`

### 3. **Infrastructure Layer (Repositories)**

- **Prisma-based Repository** (`volunteer-prisma.repository.ts`)
  - Implements `IVolunteerRepository` contract.
  - Handles database persistence.

### 4. **DTOs (Data Transfer Objects)**

- **Encapsulates API request/response formats.**
- Ensures type safety and separation between domain models and transport layer.

### 5. **Update File**

Refactor existing VolunteerService logic using new DDD repositories

```
src/services/VolunteerService.ts
```

## ✅ Unit Testing Strategy

- Tests are located in `__tests__/`
- Covers:
  - **Entities & Validation** (`volunteer.entity.test.ts`)
  - **Use Cases** (CRUD logic tests)
  - **Repository Implementation** (Database interactions with Prisma mock)

## 🚀 Running Tests

```sh
npm test src/modules/volunteer --coverage
```

#### Running individual test files

```sh
npm test src/modules/volunteer/__tests__/domain/volunteer.entity.test.ts
npm test src/modules/volunteer/__tests__/repositories/volunteer-prisma.repository.test.ts
npm test src/modules/volunteer/__tests__/use-cases/create-volunteer.use-case.test.ts
npm test src/modules/volunteer/__tests__/use-cases/delete-volunteer.use-case.test.ts
npm test src/modules/volunteer/__tests__/use-cases/get-volunteers-by-project.use-case.test.ts
npm test src/modules/volunteer/__tests__/use-cases/update-volunteer.use-case.test.ts
```
