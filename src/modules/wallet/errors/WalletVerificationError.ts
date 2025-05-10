export class WalletVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletVerificationError";
  }
}
