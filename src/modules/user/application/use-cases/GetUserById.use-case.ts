import { IUserRepository } from "../repository/user.repository";

export class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string) {
    if (!id) {
      throw new Error("User ID is required.");
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("User not found.");
    }

    return user;
  }
}
