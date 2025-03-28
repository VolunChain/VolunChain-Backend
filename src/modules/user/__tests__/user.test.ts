import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Prisma User Operations", () => {
  let userId: number;

  beforeAll(async () => {
    await prisma.users.deleteMany(); // Clean up before tests
  });

  afterAll(async () => {
    await prisma.$disconnect(); // Close Prisma connection after tests
  });

  test("Should create a new user", async () => {
    const newUser = await prisma.users.create({
      data: {
        username: "john_doe",
        email: "john@example.com",
        password_hash: "hashed_password",
        role: "user",
      },
    });

    userId = newUser.id; // Store user ID for further tests
    expect(newUser).toHaveProperty("id");
    expect(newUser.email).toBe("john@example.com");
  });

  test("Should retrieve all users", async () => {
    const allUsers = await prisma.users.findMany();
    expect(Array.isArray(allUsers)).toBe(true);
    expect(allUsers.length).toBeGreaterThan(0);
  });

  test("Should find user by email", async () => {
    const user = await prisma.users.findUnique({
      where: { email: "john@example.com" },
    });

    expect(user).not.toBeNull();
    expect(user?.email).toBe("john@example.com");
  });

  test("Should update user email", async () => {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { email: "john_updated@example.com" },
    });

    expect(updatedUser.email).toBe("john_updated@example.com");
  });

  test("Should delete a user", async () => {
    const deletedUser = await prisma.users.delete({
      where: { id: userId },
    });

    expect(deletedUser.id).toBe(userId);
  });
});
