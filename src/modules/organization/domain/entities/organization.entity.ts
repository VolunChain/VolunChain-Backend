import { BaseEntity } from "../../../shared/domain/entities/base.entity";

export interface OrganizationProps {
  id: string;
  name: string;
  email: string;
  description: string;
  category?: string;
  website?: string;
  address?: string;
  phone?: string;
  isVerified: boolean;
  logoUrl?: string;
  walletAddress?: string;
}

export class Organization extends BaseEntity {
  public readonly name: string;
  public readonly email: string;
  public readonly description: string;
  public readonly category?: string;
  public readonly website?: string;
  public readonly address?: string;
  public readonly phone?: string;
  public readonly isVerified: boolean;
  public readonly logoUrl?: string;
  public readonly walletAddress?: string;

  constructor(
    props: OrganizationProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super();
    this.name = props.name;
    this.email = props.email;
    this.description = props.description;
    this.category = props.category;
    this.website = props.website;
    this.address = props.address;
    this.phone = props.phone;
    this.isVerified = props.isVerified;
    this.logoUrl = props.logoUrl;
    this.walletAddress = props.walletAddress;
  }

  public static create(props: OrganizationProps, id?: string): Organization {
    return new Organization(props, id);
  }

  public update(props: Partial<OrganizationProps>): Organization {
    return new Organization(
      {
        id: this.id,
        name: props.name ?? this.name,
        email: props.email ?? this.email,
        description: props.description ?? this.description,
        category: props.category ?? this.category,
        website: props.website ?? this.website,
        address: props.address ?? this.address,
        phone: props.phone ?? this.phone,
        isVerified: props.isVerified ?? this.isVerified,
        logoUrl: props.logoUrl ?? this.logoUrl,
        walletAddress: props.walletAddress ?? this.walletAddress,
      },
      this.id,
      this.createdAt,
      new Date()
    );
  }
}
