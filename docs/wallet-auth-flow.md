# Wallet-Based Authentication Flow

## Overview

VolunChain now uses wallet-based authentication instead of traditional email/password authentication. This provides a more secure and decentralized approach to user identification.

## Registration Flow

### Endpoint: `POST /auth/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "walletAddress": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "profileType": "user", // or "project"
  "lastName": "Doe", // optional, for users
  "category": "environmental" // required for projects
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "uuid-here"
}
```

### Profile Types

1. **User Profile** (`profileType: "user"`)

   - Requires: name, email, walletAddress
   - Optional: lastName
   - Auto-verified upon registration

2. **Project/Organization Profile** (`profileType: "project"`)
   - Requires: name, email, walletAddress, category
   - Auto-verified upon registration

## Login Flow

### Endpoint: `POST /auth/login`

**Request Body:**

```json
{
  "walletAddress": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "wallet": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "profileType": "user"
  }
}
```

## Protected Routes

### Authentication Middleware

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Profile-Specific Routes

- `/auth/user-only` - Only accessible by user profiles
- `/auth/organization-only` - Only accessible by organization profiles
- `/auth/profile` - Accessible by both profile types

## Security Features

1. **Wallet Address Validation**: Ensures wallet addresses are valid Stellar addresses (56 characters)
2. **Unique Wallet Constraint**: Each wallet address can only be registered once
3. **JWT Tokens**: Secure token-based authentication with 24-hour expiration
4. **Auto-Verification**: All wallet-based registrations are automatically verified

## Error Handling

### Common Error Responses

**Wallet Address Not Found:**

```json
{
  "success": false,
  "message": "Wallet address not found"
}
```

**Wallet Address Already Registered:**

```json
{
  "success": false,
  "message": "Wallet address already registered"
}
```

**Invalid Token:**

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

## Migration Notes

- Password fields have been removed from User and Organization models
- All existing authentication logic has been updated to use wallet-based auth
- Email verification is no longer required for wallet-based registrations
