import { IUserRepository } from "../domain/interfaces/IUserRepository";
import { CreateUserDto } from "../dto/CreateUserDto";
import { UpdateUserDto } from "../dto/UpdateUserDto";
import { UserDTO, CreateUserData, UpdateUserData } from "../domain/dto/UserDTO";
import bcrypt from "bcryptjs";

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: CreateUserDto): Promise<UserDTO> {
    const hashedPassword = bcrypt.hashSync(data.password, 10);

    const createUserData: CreateUserData = {
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      wallet: data.wallet || "",
      isVerified: false,
    };

    return this.userRepository.create(createUserData);
  }
}

export class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserDTO> {
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

  async execute(email: string): Promise<UserDTO> {
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

  async execute(id: string, data: UpdateUserDto): Promise<UserDTO> {
    const updateUserData: UpdateUserData = {
      ...(data.name && { name: data.name }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email && { email: data.email }),
      ...(data.password && { password: data.password }),
      ...(data.wallet && { wallet: data.wallet }),
    };

    return this.userRepository.update(id, updateUserData);
  }
}
