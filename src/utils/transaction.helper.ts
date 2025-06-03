import { PrismaClient } from "@prisma/client"
import { prisma } from "../config/prisma"
import { Logger } from "./logger"

const logger = new Logger("TransactionHelper")

/**
 * Transaction Helper Utility
 *
 * Provides a reusable wrapper for executing operations within Prisma transactions
 * to ensure data consistency and atomicity across multi-step workflows.
 */

import type { Prisma } from "@prisma/client"

export type TransactionCallback<T> = (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>

export interface TransactionOptions {
  maxWait?: number
  timeout?: number
  isolationLevel?: "ReadUncommitted" | "ReadCommitted" | "RepeatableRead" | "Serializable"
}

export class TransactionHelper {
  private static instance: TransactionHelper
  private prismaClient: PrismaClient

  private constructor(prismaClient: PrismaClient) {
    this.prismaClient = prismaClient
  }

  /**
   * Get singleton instance of TransactionHelper
   */
  public static getInstance(prismaClient: PrismaClient = prisma): TransactionHelper {
    if (!TransactionHelper.instance) {
      TransactionHelper.instance = new TransactionHelper(prismaClient)
    }
    return TransactionHelper.instance
  }

  /**
   * Execute operations within a transaction
   *
   * @param callback - Function containing operations to execute within transaction
   * @param options - Transaction configuration options
   * @returns Promise resolving to the callback result
   *
   * @example
   * ```typescript
   * const result = await transactionHelper.executeInTransaction(async (tx) => {
   *   const user = await tx.user.create({ data: userData });
   *   const profile = await tx.profile.create({
   *     data: { ...profileData, userId: user.id }
   *   });
   *   return { user, profile };
   * });
   * ```
   */
  public async executeInTransaction<T>(callback: TransactionCallback<T>, options: TransactionOptions = {}): Promise<T> {
    const startTime = Date.now()
    const transactionId = this.generateTransactionId()

    try {
      logger.info(`Starting transaction ${transactionId}`, {
        transactionId,
        options,
      })

      const result = await this.prismaClient.$transaction(callback, {
        maxWait: options.maxWait || 5000, // 5 seconds default
        timeout: options.timeout || 10000, // 10 seconds default
        isolationLevel: options.isolationLevel || "ReadCommitted",
      })

      const duration = Date.now() - startTime
      logger.info(`Transaction ${transactionId} completed successfully`, {
        transactionId,
        duration: `${duration}ms`,
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error(`Transaction ${transactionId} failed`, {
        transactionId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      })

      // Re-throw the error to maintain the original error handling flow
      throw error
    }
  }

  /**
   * Execute multiple operations in parallel within a transaction
   *
   * @param operations - Array of operations to execute in parallel
   * @param options - Transaction configuration options
   * @returns Promise resolving to array of results
   */
  public async executeParallelInTransaction<T>(
    operations: TransactionCallback<T>[],
    options: TransactionOptions = {},
  ): Promise<T[]> {
    return this.executeInTransaction(async (tx) => {
      return Promise.all(operations.map((operation) => operation(tx)))
    }, options)
  }

  /**
   * Execute operations in sequence within a transaction
   *
   * @param operations - Array of operations to execute sequentially
   * @param options - Transaction configuration options
   * @returns Promise resolving to array of results
   */
  public async executeSequentialInTransaction<T>(
    operations: TransactionCallback<T>[],
    options: TransactionOptions = {},
  ): Promise<T[]> {
    return this.executeInTransaction(async (tx) => {
      const results: T[] = []
      for (const operation of operations) {
        const result = await operation(tx)
        results.push(result)
      }
      return results
    }, options)
  }

  /**
   * Check if we're currently inside a transaction
   * This is useful for conditional transaction handling
   */
  public isInTransaction(client: any): boolean {
    // Prisma doesn't provide a direct way to check if we're in a transaction
    // This is a heuristic based on the client type
    return client !== this.prismaClient
  }

  /**
   * Generate a unique transaction ID for logging purposes
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance for easy access
export const transactionHelper = TransactionHelper.getInstance()

/**
 * Decorator for methods that should run in a transaction
 *
 * @param options - Transaction configuration options
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * class MyService {
 *   @WithTransaction()
 *   async createUserWithProfile(userData: any, profileData: any) {
 *     // This method will automatically run in a transaction
 *   }
 * }
 * ```
 */
export function WithTransaction(options: TransactionOptions = {}) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const helper = TransactionHelper.getInstance()
      return helper.executeInTransaction(async (tx) => {
        // Replace the prisma instance with the transaction client
        const hasPrisma = Object.prototype.hasOwnProperty.call(this, "prisma")
        const originalPrisma = hasPrisma ? (this as any).prisma : (this as any).prismaClient
        if (hasPrisma && typeof (this as any).prisma !== "function") {
          (this as any).prisma = tx
        }
        (this as any).prismaClient = tx

        try {
          return await method.apply(this, args)
        } finally {
          // Restore original prisma instance
          if (hasPrisma) (this as any).prisma = originalPrisma
          (this as any).prismaClient = originalPrisma
        }
      }, options)
    }
  }
}

/**
 * Utility function for simple transaction execution
 *
 * @param callback - Function to execute within transaction
 * @param options - Transaction options
 * @returns Promise resolving to callback result
 */
export async function withTransaction<T>(
  callback: TransactionCallback<T>,
  options: TransactionOptions = {},
): Promise<T> {
  return transactionHelper.executeInTransaction(callback, options)
}
