export class WalletVerificationResponseDto {
  public readonly success: boolean;
  public readonly walletAddress: string;
  public readonly isValid: boolean;
  public readonly accountExists: boolean;
  public readonly balance?: string;
  public readonly sequence?: string;
  public readonly verifiedAt: Date;
  public readonly message: string;
  public readonly errorDetails?: string;

  constructor(
    success: boolean,
    walletAddress: string,
    isValid: boolean,
    accountExists: boolean,
    message: string,
    verifiedAt: Date = new Date(),
    balance?: string,
    sequence?: string,
    errorDetails?: string
  ) {
    this.success = success;
    this.walletAddress = walletAddress;
    this.isValid = isValid;
    this.accountExists = accountExists;
    this.message = message;
    this.verifiedAt = verifiedAt;
    this.balance = balance;
    this.sequence = sequence;
    this.errorDetails = errorDetails;
  }

  public static fromWalletVerification(
    verification: import("../../domain/entities/WalletVerification").WalletVerification
  ): WalletVerificationResponseDto {
    const success = verification.isValid;
    const message = verification.isVerified()
      ? "Wallet verified successfully"
      : verification.errorMessage || "Wallet verification failed";

    return new WalletVerificationResponseDto(
      success,
      verification.walletAddress,
      verification.isValid,
      verification.accountExists,
      message,
      verification.verifiedAt,
      verification.balance,
      verification.sequence,
      verification.errorMessage
    );
  }

  public static createError(
    walletAddress: string,
    errorMessage: string
  ): WalletVerificationResponseDto {
    return new WalletVerificationResponseDto(
      false,
      walletAddress,
      false,
      false,
      errorMessage,
      new Date(),
      undefined,
      undefined,
      errorMessage
    );
  }
}
