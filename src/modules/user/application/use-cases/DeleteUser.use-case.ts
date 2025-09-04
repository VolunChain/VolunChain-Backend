import { IUserRepository } from "../repository/user.repository";

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<void> {
    await this.userRepository.deleteUser(id);
  }
}
