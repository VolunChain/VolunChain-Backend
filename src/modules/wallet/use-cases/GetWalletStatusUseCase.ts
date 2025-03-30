import { IWalletRepository } from "../repositories/IWalletRepository";
import { VerifyWalletResponse } from "../dto/VerifyWalletResponse";

export class GetWalletStatusUseCase {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(publicKey: string): Promise<VerifyWalletResponse> {
    try {
      const wallet = await this.walletRepository.findByPublicKey(publicKey);

      if (!wallet) {
        return VerifyWalletResponse.failure("Wallet not found");
      }

      const isVerified = await this.walletRepository.verifyWallet(publicKey);

      if (!isVerified) {
        return VerifyWalletResponse.failure(
          "Wallet not verified in Stellar network"
        );
      }

      return VerifyWalletResponse.success();
    } catch (error) {
      console.error("Error getting wallet status:", error);
      return VerifyWalletResponse.failure("Failed to get wallet status");
    }
  }
}
