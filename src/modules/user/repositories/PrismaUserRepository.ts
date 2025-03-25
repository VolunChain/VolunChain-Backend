import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "../domain/interfaces/IUserRepository";
import { IUser } from "../domain/interfaces/IUser";

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
  async create(user: IUser): Promise<IUser> {
    return prisma.user.create({ data: user });
  }

  async findById(id: string): Promise<IUser | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async update(user: IUser): Promise<IUser> {
    return prisma.user.update({ where: { id: user.id }, data: user });
  }

  async findAll(
    page: number,
    pageSize: number
  ): Promise<{ users: IUser[]; total: number }> {
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
}
