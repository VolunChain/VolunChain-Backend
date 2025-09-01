import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../shared/domain/entities/base.entity";
import { Organization } from "../../../organization/domain/entities/organization.entity";
import { User } from "@/modules/user/domain/entities/User.entity";
import {
  NFTAlreadyMintedError,
  NFTValidationError,
  NFTMetadataError,
} from "../exceptions";

@Entity("nfts")
export class NFT extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "uuid", nullable: false })
  userId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Column({ type: "uuid", nullable: false })
  organizationId: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  tokenId?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  contractAddress?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  metadataUri?: string;

  @Column({ type: "boolean", default: false })
  isMinted: boolean;

  // Domain methods
  public mint(
    tokenId: string,
    contractAddress: string,
    metadataUri?: string
  ): void {
    if (this.isMinted) {
      throw new NFTAlreadyMintedError(this.id);
    }

    if (!tokenId || !contractAddress) {
      throw new NFTValidationError(
        "Token ID and contract address are required for minting"
      );
    }

    this.tokenId = tokenId;
    this.contractAddress = contractAddress;
    this.metadataUri = metadataUri;
    this.isMinted = true;
  }

  public updateMetadata(metadataUri: string): void {
    if (!metadataUri || metadataUri.trim().length === 0) {
      throw new NFTMetadataError("Metadata URI cannot be empty");
    }
    this.metadataUri = metadataUri;
  }

  public isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }
}

// Keep the simple domain class for use cases
export class NFTDomain {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly organizationId: string,
    public readonly description: string,
    public readonly createdAt: Date
  ) {}
}
