export const PrismaClient = class {
  constructor() {}
};

export const prismaClientSingleton = () => new PrismaClient();
export const prisma = prismaClientSingleton();
