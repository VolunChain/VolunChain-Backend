# Organization Module

## Overview

The Organization module manages all organization-related operations including creation, updates, verification, and settings management. This module handles the business logic for organizations that post volunteer opportunities on the VolunChain platform.

## Patrón de Inyección de Dependencias

El módulo utiliza un patrón de inyección de dependencias para desacoplar los componentes y facilitar las pruebas unitarias:

1. **Repositorios**: Implementan interfaces definidas en el dominio y reciben dependencias externas (como PrismaClient) a través del constructor.

2. **Casos de Uso**: Reciben el repositorio como dependencia a través del constructor, lo que permite intercambiar implementaciones fácilmente.

3. **Controladores**: Reciben todos los casos de uso necesarios a través del constructor.

4. **Módulo**: La clase `OrganizationModule` actúa como un contenedor de dependencias que inicializa y conecta todos los componentes.

## Architecture

### Domain Layer (`domain/`)

- **Entities**: Organization domain entities with business rules
- **Value Objects**: Organization-specific value objects (Address, ContactInfo, etc.)
- **Interfaces**: Domain service interfaces and repository contracts
- **Exceptions**: Organization-specific domain exceptions

### Application Layer (`application/`)

- **Services**: Application services for organization operations
- **Use Cases**: Business use cases (CreateOrganization, UpdateOrganization, etc.)
- **Interfaces**: Application service interfaces

### Infrastructure Layer (`infrastructure/`)

- **Repositories**: Prisma-based repository implementations
- **Services**: External service integrations (verification, etc.)
- **Adapters**: External system adapters

### Presentation Layer (`presentation/`)

- **Controllers**: HTTP controllers for organization endpoints
- **Routes**: Express routes for organization API
- **Middlewares**: Organization-specific middlewares
- **DTOs**: Data Transfer Objects with validation

## Development

### Using the Module

Para utilizar este módulo en otras partes de la aplicación:

```typescript
// Inicializar el módulo (normalmente en la configuración de la aplicación)
OrganizationModule.initialize();

// Obtener el controlador con todas sus dependencias inyectadas
const organizationController = OrganizationModule.getController();
```

### Adding New Features

1. **Domain Changes**

   - Update entities in `domain/entities/`
   - Add value objects in `domain/value-objects/`
   - Define interfaces in `domain/interfaces/`
   - Add exceptions in `domain/exceptions/`

2. **Application Logic**

   - Create use cases in `application/use-cases/`
   - Implement services in `application/services/`
   - Define interfaces in `application/interfaces/`

3. **Infrastructure**

   - Update repositories in `infrastructure/repositories/`
   - Add external services in `infrastructure/services/`
   - Implement adapters in `infrastructure/adapters/`

4. **Presentation**

   - Add controllers in `presentation/controllers/`
   - Create routes in `presentation/routes/`
   - Define DTOs in `presentation/dto/`
   - Add middlewares in `presentation/middlewares/`

5. **Testing**
   - Write unit tests in `__tests__/unit/`
   - Add integration tests in `__tests__/integration/`
   - Create e2e tests in `__tests__/e2e/`

### Testing

```bash
# Run all organization module tests
npm test -- --testPathPattern=modules/organization

# Run specific test types
npm test -- --testPathPattern=modules/organization/__tests__/unit
npm test -- --testPathPattern=modules/organization/__tests__/integration
npm test -- --testPathPattern=modules/organization/__tests__/e2e
```

### API Endpoints

#### Organization Management

- `POST /api/v1/organizations` - Create new organization
- `GET /api/v1/organizations/:id` - Get organization by ID
- `PUT /api/v1/organizations/:id` - Update organization
- `DELETE /api/v1/organizations/:id` - Delete organization
- `GET /api/v1/organizations` - List organizations

#### Organization Verification

- `POST /api/v1/organizations/:id/verify` - Verify organization
- `GET /api/v1/organizations/:id/verification-status` - Get verification status

#### Organization Settings

- `PUT /api/v1/organizations/:id/settings` - Update organization settings
- `GET /api/v1/organizations/:id/settings` - Get organization settings

### DTOs

All API requests and responses use DTOs with `class-validator` decorators:

```typescript
// CreateOrganizationDto
export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}
```

### Error Handling

The module uses domain-specific exceptions:

```typescript
export class OrganizationNotFoundException extends DomainException {
  constructor(organizationId: string) {
    super(`Organization with ID ${organizationId} not found`);
  }
}

export class OrganizationAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`Organization with email ${email} already exists`);
  }
}
```

## Dependencies

### Internal Dependencies

- **shared**: Common utilities, base entities, and exceptions
- **user**: User management for organization members
- **project**: Project management for organization projects

### External Dependencies

- **Prisma**: Database ORM
- **class-validator**: DTO validation
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation

## Business Rules

1. **Organization Names**: Must be unique within the platform
2. **Email Verification**: Organizations must verify their email addresses
3. **Verification Process**: Organizations must be verified before posting projects
4. **Member Management**: Organizations can have multiple members with different roles
5. **Project Limits**: Verified organizations have higher project limits

## Security Considerations

- All endpoints require authentication
- Organization owners can only modify their own organizations
- Verification status is immutable once approved
- Sensitive data is encrypted at rest
- Rate limiting applies to all endpoints

## Performance Considerations

- Database queries are optimized with proper indexing
- Caching is implemented for frequently accessed data
- Pagination is used for list endpoints
- Lazy loading for related entities

## Monitoring

- All operations are logged with appropriate log levels
- Metrics are collected for organization operations
- Error tracking is implemented for debugging
- Performance monitoring for slow queries
