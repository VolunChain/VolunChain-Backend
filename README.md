# VolunChain

**Innovating Volunteering with Blockchain 🚀**

VolunChain is a blockchain-powered platform that connects volunteers with organizations in a transparent, decentralized, and efficient way. Our mission is to make volunteering more accessible, secure, and rewarding for everyone .

---

## 🌟 Key Features

- **Opportunity Connection:** Match volunteers with organizations.
- **NFT Certifications:** Reward achievements with unique digital collectibles.
- **Tokenized Rewards:** Incentivize volunteers with blockchain tokens.
- **Community Governance:** A planned DAO model for user-driven decisions.
- **Transparency & Security:** All data and transactions are verifiable and secure.
- **Global Reach:** Designed to connect communities worldwide.

---

## 🌟 **Important!**

If you found this repository helpful or contributed to it, **please give it a ⭐ on GitHub!**  
Your support helps us grow and motivates us to continue improving VolunChain. 🙌

---

## 🛠️ Technologies Used

- **Frontend:** React, Next.js.
- **Backend:** Node.js, Express, Prisma.
- **Blockchain:** Stellar, Rust.
- **Database:** PostgreSQL, Prisma.
- **Containers:** Docker for consistent environments.
- **Architecture:** Domain-Driven Design (DDD)

---

## 🏗️ Project Structure

The project follows Domain-Driven Design principles with the following structure:

```
src/
├── modules/
│   └── project/
│       ├── domain/           # Domain entities and value objects
│       ├── repositories/     # Repository interfaces and implementations
│       ├── use-cases/        # Application business logic
│       └── dto/             # Data Transfer Objects
├── shared/                  # Shared kernel
└── infrastructure/          # External services and implementations
```

### Domain Layer

- Contains business entities and value objects
- Implements domain logic and business rules
- Independent of external concerns

### Repository Layer

- Defines interfaces for data access
- Implements data persistence logic
- Abstracts database operations

### Use Cases Layer

- Implements application business logic
- Orchestrates domain objects
- Handles transaction boundaries

### DTO Layer

- Defines data structures for API communication
- Handles data validation and transformation
- Separates domain models from API contracts

---

## 🚀 Installation

Follow these steps to set up the backend locally:

### Prerequisites:

- Node.js (v18 or higher)
- Docker & Docker Compose

### Steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-repo/volunchain-backend.git
   cd volunchain-backend
   ```

2. **Set Up Environment Variables**:
   Create a `.env` file:

   ```env
   DATABASE_URL=postgresql://volunchain:volunchain123@localhost:5432/volunchain
   PORT=3000
   JWT_SECRET=your-jwt-secret
   ```

3. **Start PostgreSQL with Docker**:

   ```bash
   docker-compose up -d
   ```

4. **Install Dependencies**:

   ```bash
   npm install
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```

---

## 🤝 How to Contribute

1. Fork the repository.
2. Create a branch for your changes:
   ```bash
   git checkout -b feature/new-feature
   ```
3. Commit your changes:
   i. The project uses pre-commit hooks to ensure code quality. They will automatically:

   - Run ESLint to check code style
   - Run Prettier to format code
   - Run tests to ensure everything works

   ii. For urgent commits that need to bypass checks:

   ```bash
   git commit -m "urgent fix" --no-verify
   ```

   ```bash
   git commit -m "Add new feature"
   ```

4. Push and create a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/license/mit).

---

## 🎉 Empowering Volunteerism, One Block at a Time.

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

-   Automatic email verification token generation and sending during registration
-   Token expiration after 24 hours for security
-   Email verification endpoint to validate tokens
-   Resend verification email functionality for users who did not receive or have expired tokens
-   Authentication middleware that restricts access to authenticated routes for non-verified users

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

-   **Domain Layer:**
    -   `User` entity extended with `isVerified`, `verificationToken`, and `verificationTokenExpires` attributes
    -   `IUserRepository` interface updated with verification-related methods
-   **Repository Layer:**
    -   `PrismaUserRepository` implements methods for finding users by verification token, setting tokens, and verifying users
-   **Use Cases:**
    -   `SendVerificationEmailUseCase`: Handles sending verification emails to users
    -   `VerifyEmailUseCase`: Validates tokens and marks users as verified
    -   `ResendVerificationEmailUseCase`: Generates new tokens and resends verification emails
-   **Authentication:**
    -   `AuthMiddleware` has been updated to check if a user is verified before allowing access to protected routes

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
