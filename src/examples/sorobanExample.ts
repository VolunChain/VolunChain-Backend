import { sorobanService } from '../services/sorobanService';

/**
 * Example of how to use the SorobanService in a real application
 */
async function sorobanExample() {
  try {
    // Example 1: Submit a transaction
    const transactionXDR = 'AAAA...'; // Your XDR-encoded transaction
    const transactionHash = await sorobanService.submitTransaction(transactionXDR);
    console.log('Transaction submitted successfully:', transactionHash);
    
    // Example 2: Invoke a contract method (e.g., minting an NFT)
    const contractId = 'your-contract-id';
    const methodName = 'mint_nft';
    const args = [
      'user-wallet-address',
      'metadata-uri'
    ];
    
    const result = await sorobanService.invokeContractMethod(
      contractId,
      methodName,
      args
    );
    
    console.log('Contract method invoked successfully:', result);
    
    // Example 3: Invoke a contract method for budget management
    const budgetContractId = 'your-budget-contract-id';
    const budgetMethodName = 'allocate_funds';
    const budgetArgs = [
      'project-id',
      1000 // amount in stroops
    ];
    
    const budgetResult = await sorobanService.invokeContractMethod(
      budgetContractId,
      budgetMethodName,
      budgetArgs
    );
    
    console.log('Budget allocation successful:', budgetResult);
    
  } catch (error) {
    console.error('Error in Soroban operations:', error);
  }
}

// Uncomment to run the example
// sorobanExample();

export { sorobanExample }; 