# Winston Context Logger Implementation

## Overview

This document describes the comprehensive Winston logging system implemented for VolunChain, providing structured JSON logging with trace ID correlation, context awareness, and security features.

## ✅ Success Metrics Achieved

- **✅ Structured Logging**: All logs are formatted in JSON with consistent structure
- **✅ Trace ID Integration**: Every request gets a unique UUID v4 trace ID for correlation
- **✅ Context Information**: Logs include timestamp, trace ID, context, request/response details
- **✅ Log Persistence**: Logs persist to files across user requests
- **✅ Security**: Sensitive data is automatically sanitized
- **✅ Performance**: No performance degradation noted
- **✅ Domain-Driven Design**: Follows project's DDD principles
- **✅ Middleware Integration**: Seamlessly integrated with existing middleware patterns

## Architecture

### Core Components

1. **Winston Configuration** (`src/config/winston.config.ts`)
   - Centralized Winston logger configuration
   - Environment-specific transports
   - JSON formatting for structured logs

2. **Trace ID Middleware** (`src/middlewares/traceId.middleware.ts`)
   - Generates unique UUID v4 for each request
   - Adds trace ID to request object and response headers
   - Enables request correlation across services

3. **Logger Service** (`src/services/logger.service.ts`)
   - Domain-driven logging service
   - Context-aware logging with trace ID support
   - Automatic sensitive data sanitization

4. **Request Logger Middleware** (`src/middlewares/requestLogger.middleware.ts`)
   - Logs incoming requests and outgoing responses
   - Captures response time and status codes
   - Includes request metadata

5. **Enhanced Error Handler** (`src/middlewares/errorHandler.ts`)
   - Structured error logging with trace IDs
   - Stack trace capture
   - Error context preservation

## Log Structure

### Standard Log Format

```json
{
  "timestamp": "2025-05-29T18:25:02.500Z",
  "level": "info",
  "message": "Incoming HTTP Request",
  "traceId": "eb507b77-667d-422c-89f2-5b8e9213a82a",
  "context": "REQUEST_LOGGER",
  "method": "GET",
  "url": "/",
  "ip": "::ffff:127.0.0.1",
  "userAgent": "curl/8.5.0",
  "meta": {
    "requestId": "eb507b77-667d-422c-89f2-5b8e9213a82a",
    "headers": {...},
    "query": {...},
    "params": {...},
    "body": {...}
  }
}
```

### Required Fields

- **timestamp**: ISO 8601 timestamp
- **level**: Log level (info, warn, error, debug)
- **message**: Human-readable message
- **traceId**: Unique request identifier
- **context**: Logger context (e.g., "REQUEST_LOGGER", "AUTH_SERVICE")

### Optional Fields

- **method**: HTTP method
- **url**: Request URL
- **ip**: Client IP address
- **userAgent**: Client user agent
- **userId**: Authenticated user ID
- **meta**: Additional metadata object

## File Organization

### Log Files

- **`logs/combined.log`**: All log levels (info and above)
- **`logs/error.log`**: Error logs only
- **`logs/exceptions.log`**: Uncaught exceptions
- **`logs/rejections.log`**: Unhandled promise rejections

### File Rotation

- Maximum file size: 10MB
- Maximum files: 5
- Automatic rotation and compression

## Environment Configuration

### Environment Variables

```env
# Logging Configuration
LOG_LEVEL=debug          # Log level (error, warn, info, debug)
NODE_ENV=development     # Environment (development, production)
```

### Log Levels by Environment

- **Development**: `debug` level, console + file output
- **Production**: `info` level, file output only
- **Test**: `error` level, minimal output

## Security Features

### Sensitive Data Sanitization

The logger automatically redacts sensitive fields:

```javascript
// Input
{
  "username": "john",
  "password": "secret123",
  "token": "jwt-token",
  "apiKey": "api-key-value"
}

// Logged Output
{
  "username": "john",
  "password": "[REDACTED]",
  "token": "[REDACTED]",
  "apiKey": "[REDACTED]"
}
```

### Sanitized Fields

- `password`
- `token`
- `secret`
- `key`
- `authorization`

## Usage Examples

### Basic Logging

```typescript
import { createLogger } from '../services/logger.service';

const logger = createLogger('USER_SERVICE');

// Info log with trace ID
logger.info('User created successfully', req, { userId: user.id });

// Error log with stack trace
logger.error('Database connection failed', error, req);

// Warning log
logger.warn('Rate limit approaching', req, { remaining: 5 });
```

### Request Logging

```typescript
// Automatic request/response logging via middleware
app.use(traceIdMiddleware);
app.use(requestLoggerMiddleware);
```

### Child Loggers

```typescript
const userLogger = logger.child('USER_OPERATIONS');
userLogger.info('Processing user registration', req);
```

## Integration Points

### Middleware Stack Order

```typescript
// 1. Trace ID (must be first)
app.use(traceIdMiddleware);

// 2. Request logging
app.use(requestLoggerMiddleware);

// 3. Other middleware
app.use(express.json());
app.use(cors());

// 4. Routes
app.use('/api', routes);

// 5. Error handler (must be last)
app.use(errorHandler);
```

### Rate Limiting Integration

```typescript
// Updated rate limit middleware uses Winston
this.logger.warn(
  `Rate limit exceeded for ${req.ip}`,
  req,
  { remaining, retryAfter }
);
```

## Testing

### Test Coverage

- ✅ Logger service functionality
- ✅ Trace ID generation and propagation
- ✅ Sensitive data sanitization
- ✅ Request/response logging
- ✅ Error logging with stack traces
- ✅ Log structure validation

### Running Tests

```bash
npm test tests/logging/winston-logger.test.ts
```

### Manual Testing

```bash
# Start test server
npx ts-node scripts/test-logging.ts

# Test endpoints
curl http://localhost:3001/
curl -X POST http://localhost:3001/test-log -H "Content-Type: application/json" -d '{"username":"test","password":"secret"}'
curl http://localhost:3001/test-error
```

## Performance Considerations

### Optimizations

- **Asynchronous Logging**: Non-blocking log writes
- **File Rotation**: Prevents disk space issues
- **Level Filtering**: Production logs only necessary levels
- **Lazy Evaluation**: Expensive operations only when needed

### Monitoring

- Log file sizes are automatically managed
- No performance impact on request processing
- Memory usage remains constant with rotation

## Troubleshooting

### Common Issues

1. **Missing Trace IDs**: Ensure `traceIdMiddleware` is first
2. **No File Logs**: Check `logs/` directory permissions
3. **Sensitive Data Leaks**: Verify sanitization rules
4. **Performance Issues**: Check log level configuration

### Debug Mode

```typescript
// Enable debug logging
process.env.LOG_LEVEL = 'debug';

// Check log output
tail -f logs/combined.log | jq '.'
```

## Migration Guide

### From Console Logging

```typescript
// Before
console.log('User logged in:', userId);
console.error('Error:', error);

// After
logger.info('User logged in', req, { userId });
logger.error('Authentication failed', error, req);
```

### Updating Existing Code

1. Replace `console.log/error` with logger methods
2. Add request context where available
3. Include relevant metadata
4. Use appropriate log levels

## Future Enhancements

### Planned Features

- [ ] Log aggregation service integration
- [ ] Real-time log streaming
- [ ] Advanced filtering and search
- [ ] Performance metrics logging
- [ ] Custom log formatters
- [ ] Log-based alerting

### Extensibility

The logging system is designed for easy extension:

- Custom transports can be added
- Additional sanitization rules
- Custom log formatters
- Integration with monitoring tools

---

## Summary

The Winston logging implementation successfully provides:

- **Structured JSON logging** with consistent format
- **Trace ID correlation** for request tracking
- **Comprehensive context** including timestamps and metadata
- **Persistent logging** across user requests
- **Security features** with automatic data sanitization
- **Performance optimization** with no degradation
- **Domain-driven architecture** following project patterns

This implementation enhances VolunChain's observability and debugging capabilities while maintaining security and performance standards.
