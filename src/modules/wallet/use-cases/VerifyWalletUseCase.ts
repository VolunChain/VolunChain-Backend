import { IWalletRepository } from "../repositories/IWalletRepository";
import { VerifyWalletRequest } from "../dto/VerifyWalletRequest";
import { VerifyWalletResponse } from "../dto/VerifyWalletResponse";
import { Wallet } from "../domain/Wallet";

export class VerifyWalletUseCase {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(request: VerifyWalletRequest): Promise<VerifyWalletResponse> {
    try {
      // Verificar si la wallet existe en la red Stellar
      const isVerified = await this.walletRepository.verifyWallet(
        request.publicKey
      );

      if (!isVerified) {
        return VerifyWalletResponse.failure(
          "Wallet not found in Stellar network"
        );
      }

      // Buscar si la wallet ya existe en nuestra base de datos
      const existingWallet = await this.walletRepository.findByPublicKey(
        request.publicKey
      );

      if (existingWallet) {
        return VerifyWalletResponse.failure("Wallet already registered");
      }

      // Crear y guardar la wallet
      const wallet = Wallet.create({
        publicKey: request.publicKey,
        userId: request.userId,
      });

      await this.walletRepository.save(wallet);

      return VerifyWalletResponse.success();
    } catch (error) {
      console.error("Error verifying wallet:", error);
      return VerifyWalletResponse.failure("Failed to verify wallet");
    }
  }
}
