import { PrismaUserRepository } from "./repositories/PrismaUserRepository";
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserByEmailUseCase,
  GetUserByIdUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
} from "./use-cases/CreateUserUseCase";
import { CreateUserDto } from "./dto/CreateUserDto";
import { UpdateUserDto } from "./dto/UpdateUserDto";

export class UserService {
  private userRepository = new PrismaUserRepository();
  private createUserUseCase = new CreateUserUseCase(this.userRepository);
  private GetUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
  private GetUserByEmailUseCase = new GetUserByEmailUseCase(
    this.userRepository
  );
  private GetUsersUseCase = new GetUsersUseCase(this.userRepository);
  private DeleteUserUseCase = new DeleteUserUseCase(this.userRepository);
  private UpdateUserUseCase = new UpdateUserUseCase(this.userRepository);

  async createUser(data: CreateUserDto) {
    return this.createUserUseCase.execute(data);
  }

  async getUserById(id: string) {
    return this.GetUserByIdUseCase.execute(id);
  }

  async getUserByEmail(email: string) {
    return this.GetUserByEmailUseCase.execute(email);
  }

  async getUsers(page: number = 1, pageSize: number = 10) {
    return this.GetUsersUseCase.execute(page, pageSize);
  }
  async deleteUser(id: string): Promise<void> {
    return this.DeleteUserUseCase.execute(id);
  }

  async updateUser(data: UpdateUserDto): Promise<void> {
    return this.UpdateUserUseCase.execute(data);
  }
}
