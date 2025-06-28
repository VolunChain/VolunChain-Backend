import { sorobanService } from "../../src/modules/soroban/application/services/SorobanService";

// Mock the soroban-client to avoid actual network calls during tests
jest.mock("soroban-client", () => {
  return {
    Server: jest.fn().mockImplementation(() => {
      return {
        sendTransaction: jest
          .fn()
          .mockResolvedValue({ hash: "mock-transaction-hash" }),
        invokeContract: jest
          .fn()
          .mockResolvedValue({ result: "mock-contract-result" }),
      };
    }),
    Transaction: jest.fn().mockImplementation(() => {
      return {};
    }),
    xdr: {},
  };
});

// Mock the config to avoid environment variable issues
jest.mock("../../src/config/soroban.config", () => {
  return {
    sorobanConfig: {
      rpcUrl: "https://mock-soroban-rpc-url",
      serverSecret: "mock-server-secret",
    },
  };
});

describe("SorobanService", () => {
  describe("submitTransaction", () => {
    it("should submit a transaction and return the hash", async () => {
      const mockTransactionXDR = "mock-transaction-xdr";
      const result = await sorobanService.submitTransaction(mockTransactionXDR);

      expect(result).toBe("mock-transaction-hash");
    });

    it("should handle errors when submitting a transaction", async () => {
      // Mock the sendTransaction method to throw an error
      const mockServer = require("soroban-client").Server.mock.results[0].value;
      mockServer.sendTransaction.mockRejectedValueOnce(
        new Error("Transaction failed")
      );

      const mockTransactionXDR = "mock-transaction-xdr";

      await expect(
        sorobanService.submitTransaction(mockTransactionXDR)
      ).rejects.toThrow("Failed to submit transaction: Transaction failed");
    });
  });

  describe("invokeContractMethod", () => {
    it("should invoke a contract method and return the result", async () => {
      const mockContractId = "mock-contract-id";
      const mockMethodName = "mock-method";
      const mockArgs = ["arg1", "arg2"];

      const result = await sorobanService.invokeContractMethod(
        mockContractId,
        mockMethodName,
        mockArgs
      );

      expect(result).toEqual({ result: "mock-contract-result" });
    });

    it("should handle errors when invoking a contract method", async () => {
      // Mock the invokeContract method to throw an error
      const mockServer = require("soroban-client").Server.mock.results[0].value;
      mockServer.invokeContract.mockRejectedValueOnce(
        new Error("Contract invocation failed")
      );

      const mockContractId = "mock-contract-id";
      const mockMethodName = "mock-method";
      const mockArgs = ["arg1", "arg2"];

      await expect(
        sorobanService.invokeContractMethod(
          mockContractId,
          mockMethodName,
          mockArgs
        )
      ).rejects.toThrow(
        "Failed to invoke contract method mock-method: Contract invocation failed"
      );
    });
  });
});
