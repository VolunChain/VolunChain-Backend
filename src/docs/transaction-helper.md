# Transaction Helper Utility

## Overview

The Transaction Helper utility provides a robust, reusable solution for managing database transactions across the VolunChain backend. It ensures data consistency and atomicity for multi-step operations while providing comprehensive logging and error handling.

## Features

- **Singleton Pattern**: Ensures consistent transaction management across the application
- **Comprehensive Logging**: Tracks transaction lifecycle with unique IDs
- **Flexible Configuration**: Customizable timeout, isolation levels, and wait times
- **Error Handling**: Proper error propagation with detailed logging
- **Multiple Execution Modes**: Sequential and parallel operation support
- **Decorator Support**: Method-level transaction decoration
- **Type Safety**: Full TypeScript support with generic types

## Basic Usage

### Simple Transaction

\`\`\`typescript
import { withTransaction } from '../utils/transaction.helper';

const result = await withTransaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const profile = await tx.profile.create({ 
    data: { ...profileData, userId: user.id } 
  });
  return { user, profile };
});
\`\`\`

### Using TransactionHelper Instance

\`\`\`typescript
import { transactionHelper } from '../utils/transaction.helper';

const result = await transactionHelper.executeInTransaction(async (tx) => {
  // Your transactional operations here
  return someResult;
}, {
  timeout: 15000,
  isolationLevel: 'Serializable'
});
\`\`\`

## Advanced Usage

### Parallel Operations

\`\`\`typescript
const operations = [
  (tx) => tx.user.create({ data: user1Data }),
  (tx) => tx.user.create({ data: user2Data }),
  (tx) => tx.user.create({ data: user3Data }),
];

const users = await transactionHelper.executeParallelInTransaction(operations);
\`\`\`

### Sequential Operations

\`\`\`typescript
const operations = [
  (tx) => tx.organization.create({ data: orgData }),
  (tx) => tx.project.create({ data: { ...projectData, organizationId: org.id } }),
  (tx) => tx.volunteer.createMany({ data: volunteersData }),
];

const results = await transactionHelper.executeSequentialInTransaction(operations);
\`\`\`

### Method Decorator

\`\`\`typescript
import { WithTransaction } from '../utils/transaction.helper';

class ProjectService {
  @WithTransaction({ timeout: 20000 })
  async createProjectWithVolunteers(projectData: any, volunteersData: any[]) {
    // This method automatically runs in a transaction
    const project = await this.prisma.project.create({ data: projectData });
    const volunteers = await this.prisma.volunteer.createMany({
      data: volunteersData.map(v => ({ ...v, projectId: project.id }))
    });
    return { project, volunteers };
  }
}
\`\`\`

## Configuration Options

### TransactionOptions

\`\`\`typescript
interface TransactionOptions {
  maxWait?: number;        // Maximum wait time for transaction to start (default: 5000ms)
  timeout?: number;        // Transaction timeout (default: 10000ms)
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
}
\`\`\`

### Default Configuration

- **maxWait**: 5 seconds
- **timeout**: 10 seconds  
- **isolationLevel**: ReadCommitted

## Error Handling

The transaction helper provides comprehensive error handling:

\`\`\`typescript
try {
  const result = await withTransaction(async (tx) => {
    // Your operations
    throw new Error('Something went wrong');
  });
} catch (error) {
  // Original error is preserved and re-thrown
  // Transaction is automatically rolled back
  console.error('Transaction failed:', error.message);
}
\`\`\`

## Logging

All transactions are automatically logged with:

- **Transaction ID**: Unique identifier for tracking
- **Duration**: Execution time measurement
- **Success/Failure**: Transaction outcome
- **Error Details**: Stack traces for failed transactions

Example log output:
\`\`\`
INFO: Starting transaction tx_1704067200000_abc123def
INFO: Transaction tx_1704067200000_abc123def completed successfully (duration: 150ms)
\`\`\`

## Best Practices

### 1. Keep Transactions Short

\`\`\`typescript
// ✅ Good - Short, focused transaction
await withTransaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.profile.create({ data: { userId: user.id, ...profileData } });
});

// ❌ Avoid - Long-running operations in transaction
await withTransaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await sendWelcomeEmail(user.email); // External API call
  await generateUserReport(user.id);  // Heavy computation
});
\`\`\`

### 2. Handle Specific Errors

\`\`\`typescript
try {
  await withTransaction(async (tx) => {
    // Operations
  });
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors
  } else if (error instanceof DatabaseError) {
    // Handle database errors
  } else {
    // Handle unexpected errors
  }
}
\`\`\`

### 3. Use Appropriate Isolation Levels

\`\`\`typescript
// For read-heavy operations
await withTransaction(async (tx) => {
  // Read operations
}, { isolationLevel: 'ReadCommitted' });

// For critical financial operations
await withTransaction(async (tx) => {
  // Critical operations
}, { isolationLevel: 'Serializable' });
\`\`\`

## Integration Examples

### ProjectService Integration

The ProjectService has been updated to use transactions for all multi-step operations:

\`\`\`typescript
// Creating project with volunteers
await withTransaction(async (tx) => {
  const project = await tx.project.create({ data: projectData });
  if (initialVolunteers.length > 0) {
    await tx.volunteer.createMany({
      data: initialVolunteers.map(v => ({ ...v, projectId: project.id }))
    });
  }
  return project;
});
\`\`\`

### Error Recovery

\`\`\`typescript
async createProjectWithRetry(projectData: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await this.createProject(projectData);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
\`\`\`

## Testing

The transaction helper includes comprehensive tests covering:

- Successful transaction execution
- Error handling and rollback
- Custom configuration options
- Parallel and sequential operations
- Decorator functionality

Run tests with:
\`\`\`bash
npm test -- tests/utils/transaction.helper.test.ts
\`\`\`

## Performance Considerations

1. **Connection Pooling**: Transactions use connection pool efficiently
2. **Timeout Management**: Prevents hanging transactions
3. **Logging Overhead**: Minimal performance impact
4. **Memory Usage**: Proper cleanup after transaction completion

## Migration Guide

### Before (Without Transactions)

\`\`\`typescript
async createProject(data: any) {
  const project = await this.prisma.project.create({ data });
  // If this fails, project is already created (inconsistent state)
  await this.prisma.volunteer.createMany({ 
    data: volunteers.map(v => ({ ...v, projectId: project.id }))
  });
  return project;
}
\`\`\`

### After (With Transactions)

\`\`\`typescript
async createProject(data: any) {
  return await withTransaction(async (tx) => {
    const project = await tx.project.create({ data });
    await tx.volunteer.createMany({ 
      data: volunteers.map(v => ({ ...v, projectId: project.id }))
    });
    return project;
  });
}
\`\`\`

## Troubleshooting

### Common Issues

1. **Transaction Timeout**: Increase timeout for long operations
2. **Deadlocks**: Use consistent ordering of operations
3. **Connection Exhaustion**: Monitor connection pool usage
4. **Isolation Level Conflicts**: Choose appropriate isolation level

### Debug Mode

Enable detailed logging by setting log level to debug:

\`\`\`typescript
// In your logger configuration
logger.level = 'debug';
\`\`\`

This will provide additional transaction debugging information.
