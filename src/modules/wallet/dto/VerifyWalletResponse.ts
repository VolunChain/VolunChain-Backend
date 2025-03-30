export class VerifyWalletResponse {
  constructor(
    public readonly isVerified: boolean,
    public readonly message: string
  ) {}

  static success(): VerifyWalletResponse {
    return new VerifyWalletResponse(true, "Wallet verified successfully");
  }

  static failure(message: string): VerifyWalletResponse {
    return new VerifyWalletResponse(false, message);
  }
}
