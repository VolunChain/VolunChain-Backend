export class NFT {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly organizationId: string,
    public readonly description: string,
    public readonly createdAt: Date
  ) {}
}
