import { IUser } from "./IUser";

export interface IUserRepository {
  create(user: IUser): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByVerificationToken(token: string): Promise<IUser | null>;
  findAll(
    page: number,
    pageSize: number
  ): Promise<{ users: IUser[]; total: number }>;
  update(user: Partial<IUser>): Promise<IUser>;
  delete(id: string): Promise<void>;
  setVerificationToken(userId: string, token: string, expires: Date): Promise<any>;
  isUserVerified(userId: string): Promise<boolean>;
  verifyUser(userId: string): Promise<any>;
}