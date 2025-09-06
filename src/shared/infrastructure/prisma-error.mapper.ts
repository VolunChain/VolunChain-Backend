import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ValidationException, ConflictException, InternalServerException } from '../exceptions';

/**
 * Maps Prisma errors to domain exceptions
 */
export function mapPrismaError(error: PrismaClientKnownRequestError): never {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const target = error.meta?.target as string[] | undefined;
      throw new ConflictException('Unique constraint violated', { 
        target: target || 'unknown',
        code: error.code 
      });
    
    case 'P2025':
      // Record not found
      throw new ValidationException('Record not found', { 
        code: error.code 
      });
    
    case 'P2003':
      // Foreign key constraint failure
      throw new ValidationException('Referenced record does not exist', { 
        code: error.code,
        field: error.meta?.field_name 
      });
    
    case 'P2014':
      // Invalid ID provided
      throw new ValidationException('Invalid ID provided', { 
        code: error.code 
      });
    
    default:
      // Unknown Prisma error
      throw new InternalServerException('Database error', { 
        code: error.code,
        message: error.message 
      });
  }
}

/**
 * Wrapper function to catch Prisma errors and rethrow mapped domain exceptions
 */
export async function prismaGuard<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      mapPrismaError(error);
    }
    // Re-throw non-Prisma errors as-is
    throw error;
  }
}

/**
 * Synchronous version of prismaGuard for non-async operations
 */
export function prismaGuardSync<T>(operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      mapPrismaError(error);
    }
    // Re-throw non-Prisma errors as-is
    throw error;
  }
}

