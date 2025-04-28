import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "../domain/interfaces/IUserRepository";
import { IUser } from "../domain/interfaces/IUser";

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
  async create(user: IUser): Promise<any> {
    return prisma.user.create({ data: user });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<any | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async update(user: IUser): Promise<any> {
    return prisma.user.update({ where: { id: user.id }, data: user });
  }

  async findAll(
    page: number,
    pageSize: number
  ): Promise<{ users: any[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);
    return { users, total };
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }


  async findByVerificationToken(token: string): Promise<any | null> {
    return prisma.user.findFirst({ where: { verificationToken: token } });
  }

  async updateVerificationToken(userId: string, token: string, expires: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        verificationToken: token,
        verificationTokenExpiresAt: expires 
      }
    });
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null
      }
    });
  }

  async isUserVerified(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true }
    });
    return user?.isVerified || false;
  }
}
