import { PrismaClient, NFT } from "@prisma/client";

const prisma = new PrismaClient();

class NFTService {
  async createNFT(data: {
    userId: string;
    organizationId: string;
    description: string;
  }): Promise<NFT> {
    return prisma.nFT.create({
      data: {
        userId: data.userId,
        organizationId: data.organizationId,
        description: data.description,
      },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async getNFTById(id: string): Promise<NFT | null> {
    return prisma.nFT.findUnique({
      where: { id },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async getNFTsByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ nfts: NFT[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const [nfts, total] = await Promise.all([
      prisma.nFT.findMany({
        where: { userId },
        include: {
          organization: true,
        },
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.nFT.count({
        where: { userId },
      }),
    ]);

    return { nfts, total };
  }
}

export default new NFTService();
