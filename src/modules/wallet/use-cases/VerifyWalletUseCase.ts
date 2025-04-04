import { IWalletRepository } from "../repositories/IWalletRepository";
import { VerifyWalletRequest } from "../dto/VerifyWalletRequest";
import { Wallet } from "../domain/Wallet";

export class VerifyWalletUseCase {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(
    request: VerifyWalletRequest
  ): Promise<{ success: boolean; message: string }> {
    // Validate input
    if (!request.publicKey || !request.userId) {
      return {
        success: false,
        message: "Invalid request: publicKey and userId are required",
      };
    }

    try {
      // Verify if the wallet exists in the Stellar network
      const isVerified = await this.walletRepository.verifyWallet(
        request.publicKey
      );
      if (!isVerified) {
        return {
          success: false,
          message: "Wallet not found in Stellar network",
        };
      }

      // Check if the wallet already exists in our database
      const existingWallet = await this.walletRepository.findByPublicKey(
        request.publicKey
      );
      if (existingWallet) {
        return { success: false, message: "Wallet already registered" };
      }

      // Create and save the wallet
      const wallet = Wallet.create({
        publicKey: request.publicKey,
        userId: request.userId,
      });

      await this.walletRepository.save(wallet);

      return {
        success: true,
        message: "Wallet successfully verified and registered",
      };
    } catch (error) {
      console.error("Error verifying wallet:", error);

      // Differentiate expected errors from unexpected errors
      if (error instanceof Error && error.message.includes("network")) {
        return {
          success: false,
          message: "Network error while verifying wallet",
        };
      }

      return {
        success: false,
        message: "Failed to verify wallet due to an unexpected error",
      };
    }
  }
}
