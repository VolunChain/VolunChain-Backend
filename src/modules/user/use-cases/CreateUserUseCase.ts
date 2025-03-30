import { IUserRepository } from "../domain/interfaces/IUserRepository";
import { CreateUserDto } from "../dto/CreateUserDto";
import { User } from "../domain/entities/User";
import bcrypt from "bcrypt";
import { UpdateUserDto } from "../dto/UpdateUserDto";

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: CreateUserDto) {
    const hashedPassword = bcrypt.hashSync(data.password, 10);

    const user = new User();
    user.id = crypto.randomUUID();
    user.name = data.name;
    user.lastName = data.lastName;
    user.email = data.email;
    user.password = hashedPassword;
    user.wallet = data.wallet;
    return this.userRepository.create(user);
  }
}

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

export class GetUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(page: number = 1, pageSize: number = 10) {
    if (page < 1 || pageSize < 1) {
      throw new Error("Invalid pagination parameters.");
    }

    return this.userRepository.findAll(page, pageSize);
  }
}

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: UpdateUserDto): Promise<void> {
    await this.userRepository.update(data);
  }
}
