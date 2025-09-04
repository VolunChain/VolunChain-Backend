import { UserEntity } from "../../domain/entities/User.entity";
import { UpdateUserDto } from "../../presentation/dto";

export interface IUserRepository {
  createUser(
    name: string,
    email: string,
    password: string,
    wallet: string
  ): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(userId: string): Promise<UserEntity | null>;
  saveVerificationToken(
    email: string,
    token: string,
    tokenExpires: Date
  ): Promise<void>;
  updateVerificationToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<void>;
  updateUser(id: string, data: UpdateUserDto): Promise<void>;
  deleteUser(id: string): Promise<void>;
  findByVerificationToken(token: string): Promise<UserEntity | null>;
  findAll(page: number, pageSize: number): Promise<UserEntity[]>;
  updateVerificationStatus(userId: string): Promise<void>;
  isUserVerified(userId: string): Promise<boolean>;
}
