# SorobanService

The SorobanService is a reusable service for secure interaction with Soroban smart contracts. It provides a central point for all smart contract operations related to minting and budget management.

## Features

- Secure connection to Soroban RPC endpoint
- Transaction submission
- Smart contract method invocation
- Error handling and logging

## Installation

1. Install the required dependencies:

```bash
npm install soroban-client dotenv
```

2. Set up your environment variables in your `.env` file:

```
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
SOROBAN_SERVER_SECRET=your_secret_key
```

## Usage

### Basic Usage

```typescript
import { sorobanService } from '../services/sorobanService';

// Submit a transaction
const transactionXDR = 'AAAA...'; // Your XDR-encoded transaction
const transactionHash = await sorobanService.submitTransaction(transactionXDR);
console.log('Transaction hash:', transactionHash);

// Invoke a contract method
const contractId = 'your-contract-id';
const methodName = 'mint_nft';
const args = ['user-wallet-address', 'metadata-uri'];

const result = await sorobanService.invokeContractMethod(
  contractId,
  methodName,
  args
);
console.log('Contract method result:', result);
```

### NFT Minting Example

```typescript
import { sorobanService } from '../services/sorobanService';

async function mintNFT(userWallet: string, metadataURI: string) {
  try {
    const contractId = 'your-nft-contract-id';
    const result = await sorobanService.invokeContractMethod(
      contractId,
      'mint_nft',
      [userWallet, metadataURI]
    );
    return result;
  } catch (error) {
    console.error('Failed to mint NFT:', error);
    throw error;
  }
}
```

### Budget Management Example

```typescript
import { sorobanService } from '../services/sorobanService';

async function allocateProjectFunds(projectId: string, amount: number) {
  try {
    const contractId = 'your-budget-contract-id';
    const result = await sorobanService.invokeContractMethod(
      contractId,
      'allocate_funds',
      [projectId, amount]
    );
    return result;
  } catch (error) {
    console.error('Failed to allocate funds:', error);
    throw error;
  }
}
```

## Testing

The SorobanService includes unit tests to ensure it works correctly. To run the tests:

```bash
npm test -- tests/sorobanService.test.ts
```

## Demo

A demo script is available to demonstrate how to use the SorobanService:

```bash
npx ts-node src/scripts/sorobanDemo.ts
```

## Error Handling

The SorobanService includes robust error handling. All methods throw errors with descriptive messages when something goes wrong. It's recommended to use try/catch blocks when calling these methods:

```typescript
try {
  const result = await sorobanService.invokeContractMethod(
    contractId,
    methodName,
    args
  );
  // Handle success
} catch (error) {
  // Handle error
  console.error('Error:', error);
}
```

## Security Considerations

- The SorobanService is intended for backend usage only.
- Never expose the SOROBAN_SERVER_SECRET in client-side code.
- Always validate inputs before passing them to the service.
- Consider implementing rate limiting for contract method invocations. 