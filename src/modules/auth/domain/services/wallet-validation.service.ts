import { Keypair } from "@stellar/stellar-sdk";

export class WalletValidationService {
  /**
   * Validates if a wallet address is a valid Stellar address
   * @param walletAddress - The wallet address to validate
   * @returns boolean indicating if the address is valid
   */
  static isValidStellarAddress(walletAddress: string): boolean {
    if (!walletAddress || typeof walletAddress !== "string") {
      return false;
    }

    // Stellar addresses must be exactly 56 characters long
    if (walletAddress.length !== 56) {
      return false;
    }

    // Stellar addresses start with 'G' (for public keys)
    if (!walletAddress.startsWith("G")) {
      return false;
    }

    try {
      // Try to create a Keypair from the address to validate it
      Keypair.fromPublicKey(walletAddress);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates wallet address format and returns detailed error information
   * @param walletAddress - The wallet address to validate
   * @returns Validation result with details
   */
  static validateWalletAddress(walletAddress: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!walletAddress) {
      errors.push("Wallet address is required");
      return { isValid: false, errors };
    }

    if (typeof walletAddress !== "string") {
      errors.push("Wallet address must be a string");
      return { isValid: false, errors };
    }

    if (walletAddress.length !== 56) {
      errors.push("Stellar wallet address must be exactly 56 characters long");
    }

    if (!walletAddress.startsWith("G")) {
      errors.push("Stellar wallet address must start with 'G'");
    }

    if (errors.length === 0) {
      try {
        Keypair.fromPublicKey(walletAddress);
      } catch {
        errors.push("Invalid Stellar wallet address format");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Normalizes a wallet address (trims whitespace, converts to uppercase)
   * @param walletAddress - The wallet address to normalize
   * @returns Normalized wallet address
   */
  static normalizeWalletAddress(walletAddress: string): string {
    return walletAddress.trim().toUpperCase();
  }

  /**
   * Checks if two wallet addresses are the same (case-insensitive)
   * @param address1 - First wallet address
   * @param address2 - Second wallet address
   * @returns boolean indicating if addresses are the same
   */
  static areAddressesEqual(address1: string, address2: string): boolean {
    return (
      this.normalizeWalletAddress(address1) ===
      this.normalizeWalletAddress(address2)
    );
  }
}
