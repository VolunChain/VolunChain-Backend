import { IUserRepository } from "../repository/user.repository";

export class GetAllUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(page: number = 1, pageSize: number = 10) {
    if (page < 1 || pageSize < 1) {
      throw new Error("Invalid pagination parameters.");
    }

    return this.userRepository.findAll(page, pageSize);
  }
}
