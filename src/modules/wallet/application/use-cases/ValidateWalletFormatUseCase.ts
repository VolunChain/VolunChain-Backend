import { StellarAddress } from "../domain/value-objects/StellarAddress";
import { WalletVerificationRequestDto } from "../presentation/dto/WalletVerificationRequestDto";
import { WalletVerificationResponseDto } from "../presentation/dto/WalletVerificationResponseDto";

export class ValidateWalletFormatUseCase {
  async execute(
    dto: WalletVerificationRequestDto
  ): Promise<WalletVerificationResponseDto> {
    try {
      // Validate wallet address format
      const stellarAddress = new StellarAddress(dto.walletAddress);

      return new WalletVerificationResponseDto(
        true,
        stellarAddress.value,
        true,
        false, // We don't check existence in this use case
        "Wallet address format is valid",
        new Date()
      );
    } catch (error: unknown) {
      return WalletVerificationResponseDto.createError(
        dto.walletAddress,
        error || "Invalid wallet address format"
      );
    }
  }
}
