import { sorobanService } from '../services/sorobanService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Demo script to demonstrate how to use the SorobanService
 * 
 * To run this script:
 * 1. Make sure you have the required environment variables set in your .env file:
 *    SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
 *    SOROBAN_SERVER_SECRET=your_secret_key
 * 
 * 2. Run the script:
 *    npx ts-node src/scripts/sorobanDemo.ts
 */
async function sorobanDemo() {
  try {
    console.log('Starting SorobanService demo...');
    
    // Example 1: Submit a transaction
    console.log('\n--- Example 1: Submit a transaction ---');
    // In a real application, you would generate this XDR from a transaction
    const transactionXDR = 'AAAA...'; // Replace with a real XDR-encoded transaction
    
    console.log('Submitting transaction...');
    const transactionHash = await sorobanService.submitTransaction(transactionXDR);
    console.log('Transaction submitted successfully!');
    console.log('Transaction hash:', transactionHash);
    
    // Example 2: Invoke a contract method (e.g., minting an NFT)
    console.log('\n--- Example 2: Invoke a contract method (NFT minting) ---');
    const contractId = 'your-contract-id'; // Replace with your actual contract ID
    const methodName = 'mint_nft';
    const args = [
      'user-wallet-address', // Replace with a real wallet address
      'metadata-uri'         // Replace with a real metadata URI
    ];
    
    console.log('Invoking contract method...');
    console.log(`Contract ID: ${contractId}`);
    console.log(`Method: ${methodName}`);
    console.log(`Args: ${JSON.stringify(args)}`);
    
    const result = await sorobanService.invokeContractMethod(
      contractId,
      methodName,
      args
    );
    
    console.log('Contract method invoked successfully!');
    console.log('Result:', result);
    
    // Example 3: Invoke a contract method for budget management
    console.log('\n--- Example 3: Invoke a contract method (budget management) ---');
    const budgetContractId = 'your-budget-contract-id'; // Replace with your actual contract ID
    const budgetMethodName = 'allocate_funds';
    const budgetArgs = [
      'project-id', // Replace with a real project ID
      1000          // amount in stroops
    ];
    
    console.log('Invoking contract method...');
    console.log(`Contract ID: ${budgetContractId}`);
    console.log(`Method: ${budgetMethodName}`);
    console.log(`Args: ${JSON.stringify(budgetArgs)}`);
    
    const budgetResult = await sorobanService.invokeContractMethod(
      budgetContractId,
      budgetMethodName,
      budgetArgs
    );
    
    console.log('Contract method invoked successfully!');
    console.log('Result:', budgetResult);
    
    console.log('\nSorobanService demo completed successfully!');
  } catch (error) {
    console.error('Error in SorobanService demo:', error);
  }
}

// Run the demo if this script is executed directly
if (require.main === module) {
  sorobanDemo()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export { sorobanDemo }; 