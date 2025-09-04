import { BaseEntity } from "@/modules/shared/domain/entities/base.entity";
import { AuthExceptions } from "../exceptions/auth.exceptions";

export interface IAuthProps extends Partial<BaseEntity> {
  wallet: string;
  isVerified: boolean;
  verificationToken?: string | null;
  verificationTokenExpires?: Date | null;
}

export class AuthEntity extends BaseEntity {
  public readonly wallet: string;
  public readonly isVerified: boolean;
  public readonly verificationToken?: string | null;
  public readonly verificationTokenExpires?: Date | null;

  constructor(
    props: IAuthProps,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super();

    if (id) this.id = id;
    if (createdAt) this.createdAt = createdAt;
    if (updatedAt) this.updatedAt = updatedAt;

    if (!props.wallet) {
      throw new AuthExceptions("wallet", "Wallet is required");
    }

    // ===== Asignación =====
    this.wallet = props.wallet;
    this.isVerified = props.isVerified;
    this.verificationToken = props.verificationToken ?? null;
    this.verificationTokenExpires = props.verificationTokenExpires ?? null;
  }

  public static create(props: IAuthProps, id?: string): AuthEntity {
    return new AuthEntity(props, id);
  }

  public update(props: Partial<IAuthProps>): AuthEntity {
    return new AuthEntity(
      {
        id: props.id ?? this.id,
        wallet: props.wallet ?? this.wallet,
        verificationToken: props.verificationToken ?? this.verificationToken,
        verificationTokenExpires:
          props.verificationTokenExpires ?? this.verificationTokenExpires,
        isVerified: props.isVerified ?? this.isVerified,
      },
      this.id,
      this.createdAt,
      new Date()
    );
  }
}
