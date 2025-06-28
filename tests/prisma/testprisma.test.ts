import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const newUser = await prisma.user.create({
    data: {
      name: "john_doe",
      email: "john@example.com",
      password: "hashed_password",
      wallet: "test-wallet",
      isVerified: false,
    },
  });
  console.log("New user created:", newUser);

  const allUsers = await prisma.user.findMany();
  console.log("All users:", allUsers);

  const userByEmail = await prisma.user.findUnique({
    where: {
      email: "john@example.com",
    },
  });
  console.log("User found by email:", userByEmail);

  const updatedUser = await prisma.user.update({
    where: {
      id: newUser.id,
    },
    data: {
      email: "john_updated@example.com",
    },
  });
  console.log("User updated:", updatedUser);

  const deletedUser = await prisma.user.delete({
    where: {
      id: newUser.id,
    },
  });
  console.log("User deleted:", deletedUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
