import { IUserRepository } from "../repository/user.repository";

export class GetUserByEmailUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string) {
    if (!email) {
      throw new Error("Email is required.");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }
}
