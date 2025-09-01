import { PrismaClient, Prisma } from "@prisma/client";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { UserDTO, CreateUserData, UpdateUserData } from "../../../domain/dto/UserDTO";
import { 
  ResourceNotFoundError, 
  ResourceConflictError, 
  ValidationError 
} from "../../../../shared/application/errors";

/**
 * Prisma-backed implementation of IUserRepository
 * 
 * Model Choice: Uses prisma.user (singular) based on the current Prisma schema
 * which defines a User model, not a users table. This aligns with the schema
 * at prisma/schema.prisma where the model is defined as "model User".
 * 
 * Note: There was a legacy "users" table in the schema, but the current
 * implementation uses the proper "User" model for consistency.
 */
export class UserPrismaRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserDTO | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      });

      return user ? this.toDTO(user) : null;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });

      return user ? this.toDTO(user) : null;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async create(data: CreateUserData): Promise<UserDTO> {
    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          wallet: data.wallet,
          isVerified: data.isVerified || false,
          verificationToken: data.verificationToken,
          verificationTokenExpires: data.verificationTokenExpires,
        }
      });

      return this.toDTO(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, data: UpdateUserData): Promise<UserDTO> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.lastName !== undefined && { lastName: data.lastName }),
          ...(data.email && { email: data.email }),
          ...(data.password && { password: data.password }),
          ...(data.wallet && { wallet: data.wallet }),
          ...(data.isVerified !== undefined && { isVerified: data.isVerified }),
          ...(data.verificationToken !== undefined && { verificationToken: data.verificationToken }),
          ...(data.verificationTokenExpires !== undefined && { verificationTokenExpires: data.verificationTokenExpires }),
        }
      });

      return this.toDTO(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findByVerificationToken(token: string): Promise<UserDTO | null> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { verificationToken: token }
      });

      return user ? this.toDTO(user) : null;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(
    page: number,
    pageSize: number
  ): Promise<{ users: UserDTO[]; total: number }> {
    try {
      const skip = (page - 1) * pageSize;
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.user.count(),
      ]);

      return {
        users: users.map(user => this.toDTO(user)),
        total
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async setVerificationToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          verificationToken: token,
          verificationTokenExpires: expires,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async isUserVerified(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { isVerified: true },
      });
      return user?.isVerified || false;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async verifyUser(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private toDTO(user: any): UserDTO {
    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      wallet: user.wallet,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken,
      verificationTokenExpires: user.verificationTokenExpires,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ResourceConflictError('A user with this email or wallet already exists');
        case 'P2025':
          throw new ResourceNotFoundError('User not found');
        default:
          throw new ValidationError(`Database operation failed: ${error.message}`);
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new ValidationError(`Validation error: ${error.message}`);
    }

    // Re-throw unexpected errors
    throw error;
  }
}
