# Winston Logging Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the existing VolunChain codebase to use the new Winston logging system while maintaining functionality and fixing TypeScript conflicts.

## Migration Steps

### Phase 1: Core Infrastructure (✅ Completed)

- [x] Winston configuration setup
- [x] Trace ID middleware implementation
- [x] Logger service creation
- [x] Request logging middleware
- [x] Error handler updates
- [x] Test implementation
- [x] Documentation

### Phase 2: TypeScript Interface Conflicts (🔄 In Progress)

The following TypeScript conflicts need to be resolved:

#### 1. AuthenticatedRequest Interface Conflicts

**Issue**: Multiple `AuthenticatedRequest` interfaces with conflicting `user` property types.

**Files Affected**:
- `src/controllers/Auth.controller.ts`
- `src/controllers/certificate.controller.ts`
- `src/middleware/authMiddleware.ts`
- `src/routes/authRoutes.ts`
- `src/routes/certificatesRoutes.ts`

**Solution**: Create a unified interface in a shared types file.

```typescript
// src/types/auth.types.ts
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  traceId?: string;
}
```

#### 2. Import/Export Issues

**Issue**: `src/controllers/userVolunteer.controller.ts` has incorrect import.

**Solution**: Fix the import statement:

```typescript
// Before
import UserVolunteerService from "../services/userVolunteer.service";

// After
import { UserVolunteerService } from "../services/userVolunteer.service";
```

### Phase 3: Gradual Code Migration

#### Step 1: Update Service Classes

Replace console logging in service classes:

```typescript
// Before
console.log('User created:', user.id);
console.error('Database error:', error);

// After
import { createLogger } from '../services/logger.service';

class UserService {
  private logger = createLogger('USER_SERVICE');

  async createUser(userData: any, req?: Request) {
    try {
      const user = await this.repository.create(userData);
      this.logger.info('User created successfully', req, { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error, req);
      throw error;
    }
  }
}
```

#### Step 2: Update Controllers

Add request context to controller logging:

```typescript
// Before
export const createUser = async (req: Request, res: Response) => {
  try {
    console.log('Creating user...');
    const user = await userService.create(req.body);
    res.json(user);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// After
import { createLogger } from '../services/logger.service';

const logger = createLogger('USER_CONTROLLER');

export const createUser = async (req: Request, res: Response) => {
  try {
    logger.info('Creating user', req);
    const user = await userService.create(req.body, req);
    logger.info('User created successfully', req, { userId: user.id });
    res.json(user);
  } catch (error) {
    logger.error('Failed to create user', error, req);
    res.status(500).json({ 
      error: 'Internal server error',
      traceId: req.traceId 
    });
  }
};
```

#### Step 3: Update Middleware

Enhance existing middleware with structured logging:

```typescript
// Before
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }
    // ... validation logic
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// After
import { createLogger } from '../services/logger.service';

const logger = createLogger('AUTH_MIDDLEWARE');

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      logger.warn('Authentication attempt without token', req);
      return res.status(401).json({ 
        message: 'No token provided',
        traceId: req.traceId 
      });
    }
    // ... validation logic
    logger.info('User authenticated successfully', req, { userId: decoded.id });
  } catch (error) {
    logger.error('Authentication failed', error, req);
    res.status(401).json({ 
      message: 'Invalid token',
      traceId: req.traceId 
    });
  }
};
```

### Phase 4: Database and External Service Logging

#### Database Operations

```typescript
// Before
prisma.$connect()
  .then(() => console.log('Database connected'))
  .catch(error => console.error('DB Error:', error));

// After
import { globalLogger } from './services/logger.service';

prisma.$connect()
  .then(() => globalLogger.info('Database connected successfully'))
  .catch(error => {
    globalLogger.error('Database connection failed', error);
    process.exit(1);
  });
```

#### Redis Operations

```typescript
// Before
redisClient.on('connect', () => console.log('Redis connected'));
redisClient.on('error', (error) => console.error('Redis error:', error));

// After
import { globalLogger } from './services/logger.service';

redisClient.on('connect', () => 
  globalLogger.info('Redis connected successfully')
);
redisClient.on('error', (error) => 
  globalLogger.error('Redis connection error', error)
);
```

### Phase 5: Testing Migration

#### Update Existing Tests

```typescript
// Before
describe('User Service', () => {
  it('should create user', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    await userService.create(userData);
    expect(consoleSpy).toHaveBeenCalled();
  });
});

// After
import { createLogger } from '../services/logger.service';

// Mock the logger
jest.mock('../services/logger.service', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}));

describe('User Service', () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = createLogger('TEST');
    jest.clearAllMocks();
  });

  it('should create user', async () => {
    await userService.create(userData);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'User created successfully',
      expect.any(Object),
      expect.objectContaining({ userId: expect.any(String) })
    );
  });
});
```

## Migration Checklist

### Pre-Migration

- [ ] Backup current codebase
- [ ] Review existing logging patterns
- [ ] Identify sensitive data fields
- [ ] Plan rollback strategy

### Core Migration

- [x] Install Winston and dependencies
- [x] Create Winston configuration
- [x] Implement trace ID middleware
- [x] Create logger service
- [x] Update error handlers
- [x] Add request logging middleware

### Code Updates

- [ ] Fix TypeScript interface conflicts
- [ ] Update service classes
- [ ] Update controllers
- [ ] Update middleware
- [ ] Update database connections
- [ ] Update external service integrations

### Testing

- [ ] Update unit tests
- [ ] Update integration tests
- [ ] Test log output format
- [ ] Verify trace ID propagation
- [ ] Test sensitive data sanitization
- [ ] Performance testing

### Deployment

- [ ] Update environment variables
- [ ] Configure log rotation
- [ ] Set up log monitoring
- [ ] Update deployment scripts
- [ ] Document operational procedures

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback**:
   ```bash
   git checkout previous-stable-commit
   npm install
   npm run build
   ```

2. **Partial Rollback**:
   - Comment out Winston middleware
   - Revert to console logging temporarily
   - Fix issues incrementally

3. **Configuration Rollback**:
   - Disable file logging
   - Use console transport only
   - Reduce log level

## Best Practices

### During Migration

1. **Incremental Changes**: Migrate one module at a time
2. **Preserve Functionality**: Ensure no feature regression
3. **Test Thoroughly**: Validate each migration step
4. **Monitor Performance**: Watch for any degradation
5. **Document Changes**: Update relevant documentation

### Post-Migration

1. **Log Monitoring**: Set up log aggregation
2. **Performance Monitoring**: Track application metrics
3. **Regular Reviews**: Periodically review log patterns
4. **Team Training**: Educate team on new logging practices

## Common Pitfalls

### Avoid These Mistakes

1. **Missing Request Context**: Always pass `req` when available
2. **Logging Sensitive Data**: Verify sanitization works
3. **Incorrect Log Levels**: Use appropriate levels for messages
4. **Missing Trace IDs**: Ensure middleware order is correct
5. **Performance Impact**: Don't log excessively in hot paths

### Debugging Tips

1. **Check Middleware Order**: Trace ID must be first
2. **Verify File Permissions**: Ensure logs directory is writable
3. **Test Log Rotation**: Verify files rotate properly
4. **Monitor Memory Usage**: Watch for memory leaks
5. **Validate JSON Format**: Ensure logs are valid JSON

## Support and Resources

### Documentation

- [Winston Logging Documentation](./WINSTON_LOGGING.md)
- [API Reference](../src/services/logger.service.ts)
- [Test Examples](../tests/logging/winston-logger.test.ts)

### Testing Tools

- [Test Script](../scripts/test-logging.ts)
- [Unit Tests](../tests/logging/)
- [Integration Examples](../docs/WINSTON_LOGGING.md#usage-examples)

### Monitoring

- Log files: `logs/combined.log`, `logs/error.log`
- Console output in development
- Performance metrics via response times

---

## Next Steps

1. **Resolve TypeScript Conflicts**: Fix interface issues
2. **Gradual Migration**: Update modules incrementally  
3. **Testing**: Comprehensive test coverage
4. **Documentation**: Update team documentation
5. **Monitoring**: Set up production log monitoring

This migration ensures VolunChain maintains its high standards for transparency and security while gaining enhanced observability capabilities.
