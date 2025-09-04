import { BcryptAdapter } from "@/config/BcryptAdapter";
import { CreateUserDto } from "../../presentation/dto";
import { IUserRepository } from "../repository/user.repository";
import { UserEntity } from "../../domain/entities/User.entity";

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private readonly encryptionAdapter: BcryptAdapter
  ) {}

  async execute(data: CreateUserDto) {
    const hashedPassword = this.encryptionAdapter.generateHash(data.password);

    const user = UserEntity.create({
      id: crypto.randomUUID(),
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      wallet: data.wallet,
    });
    return this.userRepository.createUser(
      user.id,
      user.email,
      user.password,
      user.wallet
    );
  }
}
