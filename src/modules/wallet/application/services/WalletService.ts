import { HorizonWalletRepository } from "../../repositories/HorizonWalletRepository";
import { VerifyWalletUseCase } from "../../use-cases/VerifyWalletUseCase";
import { ValidateWalletFormatUseCase } from "../../use-cases/ValidateWalletFormatUseCase";
import { WalletVerificationRequestDto } from "../../dto/WalletVerificationRequestDto";
import { WalletVerificationResponseDto } from "../../dto/WalletVerificationResponseDto";

export class WalletService {
  private walletRepository: HorizonWalletRepository;
  private verifyWalletUseCase: VerifyWalletUseCase;
  private validateWalletFormatUseCase: ValidateWalletFormatUseCase;

  constructor() {
    this.walletRepository = new HorizonWalletRepository();
    this.verifyWalletUseCase = new VerifyWalletUseCase(this.walletRepository);
    this.validateWalletFormatUseCase = new ValidateWalletFormatUseCase();
  }

  /**
   * Validates wallet address format only (no network call)
   */
  async validateWalletFormat(
    walletAddress: string
  ): Promise<WalletVerificationResponseDto> {
    const dto = new WalletVerificationRequestDto(walletAddress);
    return this.validateWalletFormatUseCase.execute(dto);
  }

  /**
   * Fully verifies wallet address including network validation
   */
  async verifyWallet(
    walletAddress: string
  ): Promise<WalletVerificationResponseDto> {
    const dto = new WalletVerificationRequestDto(walletAddress);
    return this.verifyWalletUseCase.execute(dto);
  }

  /**
   * Quick validation for registration/auth flows
   * Returns true if wallet is valid (format + network verification)
   */
  async isWalletValid(walletAddress: string): Promise<boolean> {
    try {
      const result = await this.verifyWallet(walletAddress);
      return result.success && result.isValid;
    } catch {
      return false;
    }
  }
}
