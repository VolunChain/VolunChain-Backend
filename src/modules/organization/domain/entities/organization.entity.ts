import { BaseEntity } from "../../../shared/domain/entities/base.entity";
import { DomainException } from "@/modules/shared/domain/exceptions/domain.exception";

export interface OrganizationProps {
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

export class InvalidOrganizationDataException extends DomainException {
  constructor(field: string, value: string) {
    super(`Invalid ${field}: ${value}`);
  }
}

export class OrganizationEntity extends BaseEntity {
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
    super(); // Llamar super() aunque BaseEntity no tenga constructor

    // Asignar propiedades de BaseEntity si se proporcionan
    if (id) this.id = id;
    if (createdAt) this.createdAt = createdAt;
    if (updatedAt) this.updatedAt = updatedAt;

    // Validaciones de dominio usando DomainExceptions
    if (!props.name?.trim()) {
      throw new InvalidOrganizationDataException("name", "cannot be empty");
    }

    if (!props.email?.trim()) {
      throw new InvalidOrganizationDataException("email", "cannot be empty");
    }

    if (!this.isValidEmail(props.email)) {
      throw new InvalidOrganizationDataException("email", "invalid format");
    }

    if (!props.description?.trim()) {
      throw new InvalidOrganizationDataException(
        "description",
        "cannot be empty"
      );
    }

    if (props.name.length < 2) {
      throw new InvalidOrganizationDataException(
        "name",
        "must be at least 2 characters"
      );
    }

    if (props.description.length < 10) {
      throw new InvalidOrganizationDataException(
        "description",
        "must be at least 10 characters"
      );
    }

    // Asignar propiedades después de validar
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

  public static create(
    props: OrganizationProps,
    id?: string
  ): OrganizationEntity {
    return new OrganizationEntity(props, id);
  }

  public update(props: Partial<OrganizationProps>): OrganizationEntity {
    return new OrganizationEntity(
      {
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

  // Método privado para validar formato de email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Métodos de negocio
  public verify(): OrganizationEntity {
    return this.update({ isVerified: true });
  }

  public changeCategory(category: string): OrganizationEntity {
    if (!category?.trim()) {
      throw new InvalidOrganizationDataException("category", "cannot be empty");
    }
    return this.update({ category });
  }

  public updateLogo(logoUrl: string): OrganizationEntity {
    if (!logoUrl?.trim()) {
      throw new InvalidOrganizationDataException("logoUrl", "cannot be empty");
    }
    if (!this.isValidUrl(logoUrl)) {
      throw new InvalidOrganizationDataException(
        "logoUrl",
        "invalid URL format"
      );
    }
    return this.update({ logoUrl });
  }

  public updateWebsite(website: string): OrganizationEntity {
    if (website && !this.isValidUrl(website)) {
      throw new InvalidOrganizationDataException(
        "website",
        "invalid URL format"
      );
    }
    return this.update({ website });
  }

  // Método privado para validar URLs
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
