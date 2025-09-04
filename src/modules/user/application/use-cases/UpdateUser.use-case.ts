import { UpdateUserDto } from "../../presentation/dto";
import { IUserRepository } from "../repository/user.repository";

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: UpdateUserDto): Promise<void> {
    await this.userRepository.updateUser(data);
  }
}
