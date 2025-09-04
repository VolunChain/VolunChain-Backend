import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "../../application/repository/user.repository";
import { UserEntity } from "../../domain/entities/User.entity";
import { UpdateUserDto } from "../../presentation/dto";

export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async updateUser(id: string, data: UpdateUserDto): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        wallet: data.wallet,
        updatedAt: new Date(),
      },
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(page: number, pageSize: number): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return users.map((user: UserEntity) =>
      UserEntity.create({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        wallet: user.wallet,
      })
    );
  }

  async createUser(
    name: string,
    email: string,
    password: string,
    wallet: string
  ): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
        wallet,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return UserEntity.create({
      id: user.id,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      password: user.password,
      wallet: user.wallet,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return UserEntity.create({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      wallet: user.wallet,
    });
  }

  async findById(userId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    return UserEntity.create({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      wallet: user.wallet,
    });
  }

  async saveVerificationToken(email: string, token: string): Promise<void> {
    await this.prisma.user.update({
      where: { email },
      data: {
        verificationToken: token,
        verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60), // opcional, depende tu lógica
        updatedAt: new Date(),
      },
    });
  }

  async updateVerificationToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: token,
        verificationTokenExpires: expires,
        updatedAt: new Date(),
      },
    });
  }

  async findByVerificationToken(token: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) return null;

    return UserEntity.create({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      wallet: user.wallet,
    });
  }

  async updateVerificationStatus(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
        updatedAt: new Date(),
      },
    });
  }

  async isUserVerified(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    });

    return user ? user.isVerified : false;
  }
}
