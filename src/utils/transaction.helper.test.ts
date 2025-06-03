import { PrismaClient } from "@prisma/client"
import { TransactionHelper, withTransaction } from "../../src/utils/transaction.helper"

// Mock Prisma client for testing
const mockPrismaClient = {
  $transaction: jest.fn(),
} as unknown as PrismaClient

describe("TransactionHelper", () => {
  let transactionHelper: TransactionHelper

  beforeEach(() => {
    jest.clearAllMocks()
    transactionHelper = TransactionHelper.getInstance(mockPrismaClient)
  })

  describe("executeInTransaction", () => {
    it("should execute callback within transaction successfully", async () => {
      const mockCallback = jest.fn().mockResolvedValue("success")
      const mockTransaction = jest.fn()
      ;(mockPrismaClient.$transaction as jest.Mock).mockImplementation((callback) => callback(mockTransaction))

      const result = await transactionHelper.executeInTransaction(mockCallback)

      expect(result).toBe("success")
      expect(mockPrismaClient.$transaction).toHaveBeenCalledWith(
        mockCallback,
        expect.objectContaining({
          maxWait: 5000,
          timeout: 10000,
          isolationLevel: "ReadCommitted",
        }),
      )
    })

    it("should handle transaction failure", async () => {
      const mockError = new Error("Transaction failed")
      const mockCallback = jest.fn().mockRejectedValue(mockError)
      ;(mockPrismaClient.$transaction as jest.Mock).mockImplementation((callback) => callback({}))

      await expect(transactionHelper.executeInTransaction(mockCallback)).rejects.toThrow("Transaction failed")
    })

    it("should use custom transaction options", async () => {
      const mockCallback = jest.fn().mockResolvedValue("success")
      const customOptions = {
        maxWait: 10000,
        timeout: 20000,
        isolationLevel: "Serializable" as const,
      }
      ;(mockPrismaClient.$transaction as jest.Mock).mockImplementation((callback) => callback({}))

      await transactionHelper.executeInTransaction(mockCallback, customOptions)

      expect(mockPrismaClient.$transaction).toHaveBeenCalledWith(mockCallback, customOptions)
    })
  })

  describe("executeParallelInTransaction", () => {
    it("should execute multiple operations in parallel", async () => {
      const mockOp1 = jest.fn().mockResolvedValue("result1")
      const mockOp2 = jest.fn().mockResolvedValue("result2")
      const operations = [mockOp1, mockOp2]
      ;(mockPrismaClient.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {}
        return await callback(mockTx)
      })

      const results = await transactionHelper.executeParallelInTransaction(operations)

      expect(results).toEqual(["result1", "result2"])
      expect(mockOp1).toHaveBeenCalled()
      expect(mockOp2).toHaveBeenCalled()
    })
  })

  describe("executeSequentialInTransaction", () => {
    it("should execute operations in sequence", async () => {
      const executionOrder: number[] = []
      const mockOp1 = jest.fn().mockImplementation(async () => {
        executionOrder.push(1)
        return "result1"
      })
      const mockOp2 = jest.fn().mockImplementation(async () => {
        executionOrder.push(2)
        return "result2"
      })
      const operations = [mockOp1, mockOp2]
      ;(mockPrismaClient.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {}
        return await callback(mockTx)
      })

      const results = await transactionHelper.executeSequentialInTransaction(operations)

      expect(results).toEqual(["result1", "result2"])
      expect(executionOrder).toEqual([1, 2])
    })
  })

  describe("isInTransaction", () => {
    it("should return false for main prisma client", () => {
      const result = transactionHelper.isInTransaction(mockPrismaClient)
      expect(result).toBe(false)
    })

    it("should return true for transaction client", () => {
      const mockTxClient = {}
      const result = transactionHelper.isInTransaction(mockTxClient)
      expect(result).toBe(true)
    })
  })
})

describe("withTransaction utility function", () => {
  it("should execute callback in transaction", async () => {
    const mockCallback = jest.fn().mockResolvedValue("success")

    // Mock the singleton instance
    const mockExecuteInTransaction = jest.fn().mockResolvedValue("success")
    jest.spyOn(TransactionHelper, "getInstance").mockReturnValue({
      executeInTransaction: mockExecuteInTransaction,
    } as any)

    const result = await withTransaction(mockCallback)

    expect(result).toBe("success")
    expect(mockExecuteInTransaction).toHaveBeenCalledWith(mockCallback, {})
  })
})
