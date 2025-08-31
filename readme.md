# VolunChain

**Innovating Volunteering with Blockchain ��**

VolunChain is a production-grade blockchain-powered platform that connects volunteers with organizations in a transparent, decentralized, and efficient way. Built with Domain-Driven Design principles and strict architectural standards.

---

## 🌟 Key Features

- **Opportunity Connection:** Match volunteers with organizations
- **NFT Certifications:** Reward achievements with unique digital collectibles
- **Tokenized Rewards:** Incentivize volunteers with blockchain tokens
- **Community Governance:** DAO model for user-driven decisions
- **Transparency & Security:** All data and transactions are verifiable and secure
- **Global Reach:** Designed to connect communities worldwide

---

## 🏗️ Architecture

VolunChain follows **Domain-Driven Design (DDD)** with a strict modular architecture:

```
src/
├── modules/                     # Domain modules
│   ├── auth/                    # Authentication & authorization
│   ├── user/                    # User management
│   ├── volunteer/               # Volunteer operations
│   ├── project/                 # Project management
│   ├── organization/            # Organization operations
│   ├── nft/                     # NFT & blockchain operations
│   ├── messaging/               # Communication system
│   ├── metrics/                 # Analytics & reporting
│   ├── photo/                   # Media management
│   ├── wallet/                  # Blockchain wallet operations
│   └── shared/                  # Shared kernel
├── config/                      # Application configuration
├── types/                       # Global type definitions
└── index.ts                     # Application entry point
```

### Module Structure

Every module follows this strict structure:

```
src/modules/<domain>/
├── __tests__/                   # All tests (unit, integration, e2e)
├── domain/                      # Domain layer (business logic)
│   ├── entities/                # Domain entities
│   ├── value-objects/           # Value objects
│   ├── interfaces/              # Domain interfaces
│   └── exceptions/              # Domain exceptions
├── application/                 # Application layer
│   ├── services/                # Application services
│   ├── use-cases/               # Business use cases
│   └── interfaces/              # Application interfaces
├── infrastructure/              # Infrastructure layer
│   ├── repositories/            # Repository implementations
│   ├── services/                # External services
│   └── adapters/                # External adapters
├── presentation/                # Presentation layer
│   ├── controllers/             # HTTP controllers
│   ├── routes/                  # Express routes
│   ├── middlewares/             # Module middlewares
│   └── dto/                     # Data Transfer Objects
└── README.md                    # Module documentation
```

---

## 🛠️ Technology Stack

- **Runtime:** Node.js 18+, TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (production), SQLite (testing)
- **ORM:** Prisma
- **Blockchain:** Stellar, Soroban
- **Validation:** class-validator, class-transformer
- **Testing:** Jest, Supertest
- **Documentation:** OpenAPI/Swagger
- **Containerization:** Docker, Docker Compose
- **Architecture:** Domain-Driven Design (DDD)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-repo/volunchain-backend.git
   cd volunchain-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start database**

   ```bash
   docker-compose up -d
   ```

5. **Run migrations**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

---

## 🧪 Testing

### Test Setup

```bash
# Create test environment
cp .env.example .env.test
# Set DB_TYPE=sqlite in .env.test

# Run all tests
npm test

# Run specific test types
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests

# Run tests for specific module
npm test -- --testPathPattern=modules/user
```

### Test Coverage

- **Unit Tests**: Test individual functions/classes
- **Integration Tests**: Test module interactions
- **E2E Tests**: Test complete user workflows
- **Coverage Target**: 80% minimum per module

---

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: `http://localhost:3000/openapi.yaml`

### Authentication

Most endpoints require authentication via JWT token:

```bash
# Login to get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/users/profile
```

---

## 🔧 Development

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run type-check

# All quality checks
npm run quality
```

### Pre-commit Hooks

The project uses pre-commit hooks that automatically:

- Run ESLint for code style
- Run Prettier for formatting
- Run TypeScript type checking
- Run affected tests

### Database Management

```bash
# Generate migration
npm run db:migrate:generate

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# Seed database
npm run db:seed
```

---

## 📁 Module Overview

### Core Modules

| Module           | Purpose                        | Key Features                            |
| ---------------- | ------------------------------ | --------------------------------------- |
| **auth**         | Authentication & authorization | JWT, email verification, password reset |
| **user**         | User management                | Profile, preferences, settings          |
| **volunteer**    | Volunteer operations           | Registration, skills, availability      |
| **project**      | Project management             | Creation, updates, status tracking      |
| **organization** | Organization operations        | Management, verification, settings      |
| **nft**          | NFT operations                 | Minting, transfers, metadata            |
| **messaging**    | Communication                  | Real-time messaging, notifications      |
| **metrics**      | Analytics                      | Usage statistics, reporting             |
| **photo**        | Media management               | Upload, storage, optimization           |
| **wallet**       | Blockchain wallet              | Stellar integration, verification       |

### Shared Module

The `shared` module contains:

- Common utilities and helpers
- Shared domain entities
- Cross-cutting concerns
- Infrastructure adapters

---

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**

   ```bash
   # Set production environment variables
   NODE_ENV=production
   DATABASE_URL=your-production-db-url
   JWT_SECRET=your-secure-jwt-secret
   ```

2. **Database Migration**

   ```bash
   npm run db:migrate
   ```

3. **Build Application**

   ```bash
   npm run build
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

### Docker Deployment

```bash
# Build image
docker build -t volunchain-backend .

# Run container
docker run -p 3000:3000 volunchain-backend
```

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for:

- **Architecture standards** and module structure
- **Coding conventions** and best practices
- **Testing requirements** and quality standards
- **Development workflow** and PR guidelines

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the coding standards in CONTRIBUTING.md
4. Write tests for your changes
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🆘 Support

- **Documentation**: Check module README files
- **Issues**: [GitHub Issues](https://github.com/your-repo/volunchain-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/volunchain-backend/discussions)

---

## 🌟 Star the Repository

If you found this project helpful, please give it a ⭐ on GitHub! Your support helps us grow and motivates us to continue improving VolunChain.

---

**Built with ❤️ for the volunteer community**

## Rate Limiting Configuration

The application implements rate limiting to protect sensitive endpoints and prevent abuse.

### Configuration

Rate limiting can be configured via environment variables:

- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting in milliseconds (default: 15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum number of requests allowed in the time window (default: 100)
- `RATE_LIMIT_MESSAGE`: Custom message when rate limit is exceeded

### Protected Endpoints

The following endpoints have rate limiting:

- `/auth/login`
- `/auth/register`
- Wallet verification endpoints
- Email-related endpoints

### Customization

You can adjust rate limit settings in your `.env` file or use the default configurations.

# Email Verification System

## Overview

The Email Verification system allows users to verify their email addresses during the registration process, ensuring the authenticity of user accounts and adding an extra layer of security to the application.

## Features

- Automatic email verification token generation and sending during registration
- Token expiration after 24 hours for security
- Email verification endpoint to validate tokens
- Resend verification email functionality for users who did not receive or have expired tokens
- Authentication middleware that restricts access to authenticated routes for non-verified users

## Usage

### Registration Flow

1.  When a user registers, the system automatically sends a verification email to the provided email address.
2.  The email contains a unique verification link with a token parameter.
3.  The token is valid for 24 hours.

### Verification Process

1.  When the user clicks the verification link, the system validates the token.
2.  If the token is valid and not expired, the user's email is marked as verified.
3.  The user can now access authenticated routes that require verification.

### Resending Verification Email

If a user did not receive the verification email or the token has expired, they can request a new verification email:

1.  User makes a `POST` request to `/api/auth/resend-verification-email` with their email address.
2.  The system generates a new token and sends a fresh verification email.

## API Endpoints

### Registration and Verification

- `POST /auth/register` - Register a new user and send verification email
- `GET /auth/verify-email/:token` - Verify email using the token from the email link
- `POST /auth/resend-verification` - Resend the verification email
- `GET /auth/verification-status` - Check if the current user's email is verified

### Authentication with Verification Check

## Implementation Details

The email verification system follows Domain-Driven Design principles:

- **Domain Layer:**
  - `User` entity extended with `isVerified`, `verificationToken`, and `verificationTokenExpires` attributes
  - `IUserRepository` interface updated with verification-related methods
- **Repository Layer:**
  - `PrismaUserRepository` implements methods for finding users by verification token, setting tokens, and verifying users
- **Use Cases:**
  - `SendVerificationEmailUseCase`: Handles sending verification emails to users
  - `VerifyEmailUseCase`: Validates tokens and marks users as verified
  - `ResendVerificationEmailUseCase`: Generates new tokens and resends verification emails
- **Authentication:**
  - `AuthMiddleware` has been updated to check if a user is verified before allowing access to protected routes

## Environment Configuration

The email verification system requires the following environment variables:

- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_SECRET` - Secret key for verification tokens
- `EMAIL_SERVICE` - Email service provider (e.g., 'gmail')
- `EMAIL_USER` - Email address for sending verification emails
- `EMAIL_PASSWORD` - Password for the email account
- `BASE_URL` - Base URL for verification links (e.g., 'http://localhost:3000')

# Wallet Verification System

## Overview

The Wallet Verification system integrates with Stellar's Horizon API to verify the authenticity of Stellar wallet addresses during user registration and authentication. This ensures that only valid Stellar addresses are used in the platform and provides additional security by validating wallet ownership.

## Features

- **Format Validation**: Validates Stellar address format using Stellar SDK
- **Network Verification**: Verifies wallet addresses against Stellar Horizon API
- **Account Existence Check**: Determines if a wallet account exists on the Stellar network
- **Balance and Sequence Retrieval**: Fetches account details for existing wallets
- **Integration with Auth Flow**: Seamlessly integrated into registration and login processes
- **Comprehensive Error Handling**: User-friendly error messages for various failure scenarios

## Architecture

The wallet verification system follows Domain-Driven Design principles:

### Domain Layer

- `WalletVerification` entity: Represents wallet verification results
- `StellarAddress` value object: Encapsulates Stellar address validation logic
- `IWalletRepository` interface: Defines wallet verification operations

### Repository Layer

- `HorizonWalletRepository`: Implements Horizon API integration for wallet verification

### Use Cases

- `VerifyWalletUseCase`: Handles complete wallet verification including network calls
- `ValidateWalletFormatUseCase`: Validates wallet address format only (no network calls)

### DTOs

- `WalletVerificationRequestDto`: Request structure for wallet verification
- `WalletVerificationResponseDto`: Response structure with verification results

### Services

- `WalletService`: High-level service for wallet operations

## API Endpoints

### Wallet Verification

- `POST /auth/verify-wallet` - Fully verify a wallet address (format + network)
- `POST /auth/validate-wallet-format` - Validate wallet address format only

### Integration with Auth Endpoints

- `POST /auth/register` - Now includes wallet verification before user creation
- `POST /auth/login` - Now validates wallet address before authentication

## Usage

### Registration Flow with Wallet Verification

1. User provides wallet address during registration
2. System validates wallet address format
3. System verifies wallet against Stellar Horizon API
4. If verification succeeds, user registration proceeds
5. If verification fails, registration is rejected with appropriate error message

### Authentication Flow with Wallet Verification

1. User provides wallet address for login
2. System validates wallet address before checking user existence
3. If wallet is invalid, authentication is rejected immediately
4. If wallet is valid, normal authentication flow proceeds

### Direct Wallet Verification

```bash
# Verify wallet address (format + network)
curl -X POST http://localhost:3000/api/auth/verify-wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "GCKFBEIYTKP5RDBQMUTAPDCFZDFNVTQNXUCUZMAQYVWLQHTQBDKTQRQY"}'

# Validate wallet format only
curl -X POST http://localhost:3000/api/auth/validate-wallet-format \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "GCKFBEIYTKP5RDBQMUTAPDCFZDFNVTQNXUCUZMAQYVWLQHTQBDKTQRQY"}'
```

## Environment Configuration

The wallet verification system requires the following environment variables:

- `HORIZON_URL` - Stellar Horizon API URL (default: 'https://horizon-testnet.stellar.org')
- `STELLAR_NETWORK` - Stellar network ('testnet' or 'mainnet', default: 'testnet')

## Error Handling

The system provides comprehensive error handling for various scenarios:

- **Invalid Format**: When wallet address format is incorrect
- **Network Errors**: When Horizon API is unreachable
- **Account Not Found**: When wallet address is valid but account doesn't exist (this is not an error)
- **Duplicate Wallet**: When attempting to register with an already registered wallet

## Testing

Comprehensive test coverage includes:

- Unit tests for all domain entities and value objects
- Use case tests with mocked dependencies
- Repository tests with mocked Horizon API responses
- Integration tests for auth flow with wallet verification

Run wallet verification tests:

```bash
npm test -- --testPathPattern=wallet
```
