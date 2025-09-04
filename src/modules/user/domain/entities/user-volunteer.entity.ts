import { IUserProps, UserEntity } from "./User.entity";
import { InvalidUserDataException } from "../exceptions/user.exceptions";

export class UserVolunteer extends UserEntity {
  volunteerId: string;
  joinedAt: Date;

  private constructor(props: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
    wallet: string;
    isVerified?: boolean;
    verificationToken?: string | null;
    verificationTokenExpires?: Date | null;
    volunteerId: string;
    joinedAt?: Date;
  }) {
    super(props);
    this.volunteerId = props.volunteerId;
    this.joinedAt = props.joinedAt ?? new Date();
  }

  // Overload 1: Maintains compatibility with UserEntity
  public static override create(props: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
    wallet: string;
    volunteerId: string; // Agregar volunteerId como requerido
    joinedAt?: Date;
  }): UserVolunteer;

  // Overload 2: Your original method to create from existing UserEntity
  public static create(
    baseUser: UserEntity,
    volunteerId: string
  ): UserVolunteer;

  // Implementación que maneja ambos casos
  public static create(
    propsOrBaseUser: IUserProps,
    volunteerId?: string
  ): UserVolunteer {
    if (!volunteerId) {
      throw new InvalidUserDataException(
        "volunteerId",
        "Volunteer ID is required"
      );
    }

    return new UserVolunteer({
      id: propsOrBaseUser.id,
      name: propsOrBaseUser.name,
      lastName: propsOrBaseUser.lastName,
      email: propsOrBaseUser.email,
      password: propsOrBaseUser.password,
      wallet: propsOrBaseUser.wallet,
      isVerified: propsOrBaseUser.isVerified,
      verificationToken: propsOrBaseUser.verificationToken,
      verificationTokenExpires: propsOrBaseUser.verificationTokenExpires,
      volunteerId,
      joinedAt: new Date(),
    });
  }

  public isUserAssigned(userId: string): boolean {
    return this.id === userId;
  }

  public isVolunteerAssigned(volunteerId: string): boolean {
    return this.volunteerId === volunteerId;
  }
}
