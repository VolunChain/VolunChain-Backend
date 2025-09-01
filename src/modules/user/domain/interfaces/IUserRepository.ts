import { UserDTO, CreateUserData, UpdateUserData } from "../dto/UserDTO";

export interface IUserRepository {
  findById(id: string): Promise<UserDTO | null>;
  findByEmail(email: string): Promise<UserDTO | null>;
  create(data: CreateUserData): Promise<UserDTO>;
  update(id: string, data: UpdateUserData): Promise<UserDTO>;
  delete(id: string): Promise<void>;
  findByVerificationToken(token: string): Promise<UserDTO | null>;
  findAll(
    page: number,
    pageSize: number
  ): Promise<{ users: UserDTO[]; total: number }>;
  setVerificationToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<void>;
  isUserVerified(userId: string): Promise<boolean>;
  verifyUser(userId: string): Promise<void>;
}
