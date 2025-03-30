export class VerifyWalletRequest {
  constructor(
    public readonly publicKey: string,
    public readonly userId: string
  ) {}

  static create(props: {
    publicKey: string;
    userId: string;
  }): VerifyWalletRequest {
    return new VerifyWalletRequest(props.publicKey, props.userId);
  }
}
