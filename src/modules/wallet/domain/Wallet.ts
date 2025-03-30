export class Wallet {
  constructor(
    public readonly id: string,
    public readonly publicKey: string,
    public readonly userId: string,
    public readonly isVerified: boolean = false
  ) {}

  static create(props: { publicKey: string; userId: string }): Wallet {
    return new Wallet(crypto.randomUUID(), props.publicKey, props.userId);
  }
}
