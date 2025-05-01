import dotenv from 'dotenv';

dotenv.config();

export const sorobanConfig = {
  rpcUrl: process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  serverSecret: process.env.SOROBAN_SERVER_SECRET,
};

// Validate required environment variables
if (!sorobanConfig.serverSecret) {
  throw new Error('SOROBAN_SERVER_SECRET environment variable is required');
} 