# VolunChain Backend - NFT Module (DDD Refactor)

## 📌 Overview

This module implements the **NFT** domain using **Domain-Driven Design (DDD)** principles. It ensures proper separation of concerns and maintains a clean architecture. The repository layer is implemented using **Prisma ORM**, and the business logic is handled via use cases.

## 📂 Project Module Structure

```
modules/nft/
│
├── domain/
|          ├──entities/                          # Domain Layer
│          |          ├── nft.entity.ts           # NFT entity (domain model)
|          ├──interfaces/
│                     ├── nft.interface.ts        # NFT attribute interfaces
│
├── dto/                        # Data Transfer Objects
│   ├── nft.dto.ts              # DTOs for request handling
│
├── repositories/               # Repository Layer
│   ├── implementations/
│   │   ├── nft.repository.ts  # repository
│   ├── interfaces/
│   │   ├── nft-repository.interface.ts # Repository contract
│
├── use-cases/                  # Use Cases (Application Layer)
│   ├── create-nft.use-case.ts
│   ├── delete-nft.use-case.ts
│   ├── get-nft-by-user.use-case.ts
|   ├── get-nft-by-ID.use-case.ts
│
```

## 🏛️ Domain-Driven Design (DDD) Implementation

### 1. **Domain Layer**

- **`nft.entity.ts`**: Implements the `NFT` entity with validation and business logic.
- **`nft.interface.ts`**: Defines attribute interfaces for strict type enforcement.

### 2. **Application Layer (Use Cases)**

- **Handles business logic independent of data storage.**
- Implements CRUD operations:
  - `CreateNFTUseCase`
  - `GetNFTByIDUseCase`
  - `DeleteNFTUseCase`
  - `GetNFTByUserUseCase`

### 3. **Infrastructure Layer (Repositories)**

- **Prisma-based Repository** (`nft-prisma.repository.ts`)
  - Implements `INFTRepository` contract.
  - Handles database persistence.

### 4. **DTOs (Data Transfer Objects)**

- **Encapsulates API request/response formats.**
- Ensures type safety and separation between domain models and transport layer.

### 5. **Update File**

Refactor existing NFTService logic using new DDD repositories

```
src/services/NFTService.ts
```
