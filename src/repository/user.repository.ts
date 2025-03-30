import { Repository, DataSource } from "typeorm";
import { User } from "../entities/User";
import { IUserRepository } from "./IUserRepository";

export class UserRepository
  extends Repository<User>
  implements IUserRepository
{
  constructor(dataSource: DataSource) {
    super(User, dataSource.manager);
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    wallet: string
  ): Promise<User> {
    const user = this.create({ name, email, password, wallet });
    return await this.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findById(userId: string): Promise<User | null> {
    return this.findOne({ where: { id: userId } });
  }

  async saveVerificationToken(email: string, token: string): Promise<void> {
    await this.update({ email }, { verificationToken: token });
  }

  async updateVerificationToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<void> {
    await this.update(
      { id: userId },
      { verificationToken: token, verificationTokenExpires: expires }
    );
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.findOne({ where: { verificationToken: token } });
  }

  async updateVerificationStatus(userId: string): Promise<void> {
    await this.update(
      { id: userId },
      {
        isVerified: true,
        verificationToken: undefined,
        verificationTokenExpires: undefined,
      }
    );
  }

  async isUserVerified(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user ? user.isVerified : false;
  }
}
