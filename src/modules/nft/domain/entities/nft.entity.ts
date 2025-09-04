import { BaseEntity } from "../../../shared/domain/entities/base.entity";
import { INFT } from "../interfaces/nft.interface";

export class NFTEntity extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly createdAt: Date,
    public readonly isMinted?: boolean,
    public readonly metadataUri?: string,
    public readonly tokenId?: string,
    public readonly userId?: string,
    public readonly organizationId?: string
  ) {
    super();
  }

  public static create(props: INFT): NFTEntity {
    const nft = new NFTEntity(
      props.id,
      props.description,
      props.createdAt,
      props.isMinted,
      props.metadataUri,
      props.tokenId,
      props.userId,
      props.organizationId
    );
    return nft;
  }

  public isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }
}
