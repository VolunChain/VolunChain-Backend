import { IWalletRepository } from "../domain/interfaces/IWalletRepository";
import { StellarAddress } from "../domain/value-objects/StellarAddress";
import { WalletVerificationRequestDto } from "../presentation/dto/WalletVerificationRequestDto";
import { WalletVerificationResponseDto } from "../presentation/dto/WalletVerificationResponseDto";

export class VerifyWalletUseCase {
  constructor(private walletRepository: IWalletRepository) {}

  async execute(
    dto: WalletVerificationRequestDto
  ): Promise<WalletVerificationResponseDto> {
    try {
      // First validate the wallet address format
      const stellarAddress = new StellarAddress(dto.walletAddress);

      // Then verify the wallet using Horizon API
      const verification =
        await this.walletRepository.verifyWallet(stellarAddress);

      return WalletVerificationResponseDto.fromWalletVerification(verification);
    } catch (error: unknown) {
      return WalletVerificationResponseDto.createError(
        dto.walletAddress,
        error || "Wallet verification failed"
      );
    }
  }
}
