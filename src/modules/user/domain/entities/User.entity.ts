import { BaseEntity } from "@/modules/shared/domain/entities/base.entity";

export interface IUserProps {
  id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  wallet: string;
  isVerified?: boolean;
  verificationToken?: string | null;
  verificationTokenExpires?: Date | null;
}

export class UserEntity extends BaseEntity {
  id: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  wallet: string;
  isVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpires: Date | null;

  constructor(props: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
    wallet: string;
    isVerified?: boolean;
    verificationToken?: string | null;
    verificationTokenExpires?: Date | null;
  }) {
    super();
    this.id = props.id;
    this.name = props.name;
    this.lastName = props.lastName;
    this.email = props.email;
    this.password = props.password;
    this.wallet = props.wallet;
    this.isVerified = props.isVerified ?? false;
    this.verificationToken = props.verificationToken ?? null;
    this.verificationTokenExpires = props.verificationTokenExpires ?? null;
  }

  public static create(props: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
    wallet: string;
  }): UserEntity {
    // Validate fields
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("name is required");
    }
    if (!props.email || props.email.trim().length === 0) {
      throw new Error("email is required");
    }
    if (!props.password || props.password.trim().length === 0) {
      throw new Error("password is required");
    }
    if (!props.wallet || props.wallet.trim().length === 0) {
      throw new Error("wallet is required");
    }

    const user = new UserEntity(props);
    return user;
  }

  // // Ejemplo de regla de negocio dentro de la entidad:
  // verifyAccount(token: string): boolean {
  //   if (
  //     this.verificationToken &&
  //     this.verificationToken === token &&
  //     this.verificationTokenExpires &&
  //     this.verificationTokenExpires > new Date()
  //   ) {
  //     this.isVerified = true;
  //     this.verificationToken = null;
  //     this.verificationTokenExpires = null;
  //     return true;
  //   }
  //   return false;
  // }
}
