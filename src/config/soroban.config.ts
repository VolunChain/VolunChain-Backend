import dotenv from "dotenv";
import { env } from "./env";

dotenv.config();

export const sorobanConfig = {
  rpcUrl: env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org",
  serverSecret: env.SOROBAN_SERVER_SECRET,
};

// Validate required environment variables
if (!sorobanConfig.serverSecret) {
  throw new Error("SOROBAN_SERVER_SECRET environment variable is required");
}
