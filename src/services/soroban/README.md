# Soroban Integration

This directory contains the Soroban integration for the VolunChain backend. The SorobanService provides a secure way to interact with Soroban smart contracts for minting NFTs and managing budgets.

## Directory Structure

```
src/services/soroban/
├── README.md           # This file
├── sorobanService.ts   # The main service for Soroban interactions
└── demo.ts             # Demo script showing how to use the service

src/config/
└── soroban.config.ts   # Configuration for Soroban

tests/soroban/
└── sorobanService.test.ts  # Tests for the SorobanService
```

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
import { sorobanService } from '../services/soroban/sorobanService';

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
import { sorobanService } from '../services/soroban/sorobanService';

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
import { sorobanService } from '../services/soroban/sorobanService';

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
npm test -- tests/soroban/sorobanService.test.ts
```

## Demo

A demo script is available to demonstrate how to use the SorobanService:

```bash
npx ts-node src/services/soroban/demo.ts
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

## Contributing

### Adding New Features

When adding new features to the SorobanService:

1. Update the `sorobanService.ts` file with your new methods
2. Add tests for your new methods in `tests/soroban/sorobanService.test.ts`
3. Update the demo script in `src/services/soroban/demo.ts` to showcase your new features
4. Update this README with documentation for your new features

### Modifying Existing Features

When modifying existing features:

1. Make sure to maintain backward compatibility
2. Update tests to reflect your changes
3. Update the demo script if necessary
4. Update this README if the usage has changed

### Testing Your Changes

Always test your changes thoroughly:

1. Run the unit tests: `npm test -- tests/soroban/sorobanService.test.ts`
2. Run the demo script: `npx ts-node src/services/soroban/demo.ts`
3. Test in a development environment before deploying to production

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Make sure you have set the required environment variables in your `.env` file
   - Check that the variables are being loaded correctly

2. **Connection Issues**
   - Verify that the SOROBAN_RPC_URL is correct and accessible
   - Check your network connection

3. **Contract Method Invocation Failures**
   - Verify that the contract ID is correct
   - Check that the method name and arguments match the contract's interface
   - Look for error messages in the console

### Getting Help

If you encounter issues not covered here:

1. Check the [Soroban documentation](https://soroban.stellar.org/docs)
2. Look for similar issues in the project's issue tracker
3. Ask for help in the project's communication channels 