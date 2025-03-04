import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class UserService {
  async createUser(
    name: string,
    lastName: string,
    email: string,
    password: string,
    wallet: string
  ) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("Email already exists");

    return await prisma.user.create({
      data: { name, lastName, email, password, wallet },
    });
  }

  async getUserById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async getUsers(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

export default UserService;
