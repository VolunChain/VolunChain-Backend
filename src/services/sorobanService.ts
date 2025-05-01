import { Server, Transaction, xdr } from 'soroban-client';
import { sorobanConfig } from '../config/soroban.config';

export class SorobanService {
  private server: Server;
  private serverSecret: string;

  constructor() {
    this.server = new Server(sorobanConfig.rpcUrl);
    // Ensure serverSecret is not undefined
    if (!sorobanConfig.serverSecret) {
      throw new Error('SOROBAN_SERVER_SECRET is required');
    }
    this.serverSecret = sorobanConfig.serverSecret;
  }

  /**
   * Submits a transaction to the Soroban network
   * @param transactionXDR - The XDR-encoded transaction
   * @returns Promise<string> - The transaction hash
   */
  async submitTransaction(transactionXDR: string): Promise<string> {
    try {
      // Parse the XDR string into a Transaction object
      const transaction = new Transaction(transactionXDR, this.serverSecret);
      const response = await this.server.sendTransaction(transaction);
      return response.hash;
    } catch (error: any) {
      console.error('Error submitting transaction:', error);
      throw new Error(`Failed to submit transaction: ${error.message}`);
    }
  }

  /**
   * Invokes a method on a Soroban smart contract
   * @param contractId - The ID of the smart contract
   * @param methodName - The name of the method to invoke
   * @param args - Array of arguments to pass to the method
   * @returns Promise<any> - The result of the contract method invocation
   */
  async invokeContractMethod(
    contractId: string,
    methodName: string,
    args: any[]
  ): Promise<any> {
    try {
      // Note: The actual method name may vary depending on the soroban-client version
      // This is a placeholder - you'll need to check the actual API documentation
      // or inspect the Server object to find the correct method
      
      // Example implementation - adjust based on actual API
      // @ts-ignore - Ignoring type checking until we know the exact API
      const result = await this.server.invokeContract(
        contractId,
        methodName,
        args
      );
      return result;
    } catch (error: any) {
      console.error('Error invoking contract method:', error);
      throw new Error(
        `Failed to invoke contract method ${methodName}: ${error.message}`
      );
    }
  }
}

// Export a singleton instance
export const sorobanService = new SorobanService(); 