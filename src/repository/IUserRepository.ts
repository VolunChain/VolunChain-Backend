import { User } from "../entities/User";

export interface IUserRepository {
  createUser(
    name: string,
    email: string,
    password: string,
    wallet: string
  ): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(userId: string): Promise<User | null>;
  saveVerificationToken(email: string, token: string): Promise<void>;
  updateVerificationToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<void>;
  findByVerificationToken(token: string): Promise<User | null>;
  updateVerificationStatus(userId: string): Promise<void>;
  isUserVerified(userId: string): Promise<boolean>;
}
