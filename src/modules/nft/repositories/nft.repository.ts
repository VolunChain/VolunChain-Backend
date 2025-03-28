import { PrismaClient } from "@prisma/client";
import { INFTRepository } from "./INFTRepository";
import { NFT } from "../domain/entities/nft.entity";

export class NFTRepository implements INFTRepository {
  private prisma = new PrismaClient();

  async create(nft: NFT): Promise<NFT> {
    const newNFT = await this.prisma.nFT.create({
      data: {
        userId: nft.userId,
        organizationId: nft.organizationId,
        description: nft.description,
      },
    });
    return new NFT(
      newNFT.id,
      newNFT.userId,
      newNFT.organizationId,
      newNFT.description,
      newNFT.createdAt
    );
  }

  async findById(id: string): Promise<NFT | null> {
    const nft = await this.prisma.nFT.findUnique({ where: { id } });
    return nft
      ? new NFT(
          nft.id,
          nft.userId,
          nft.organizationId,
          nft.description,
          nft.createdAt
        )
      : null;
  }

  async findByUserId(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ nfts: NFT[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const [nfts, total] = await Promise.all([
      this.prisma.nFT.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.nFT.count({ where: { userId } }),
    ]);

    return {
      nfts: nfts.map(
        (nft) =>
          new NFT(
            nft.id,
            nft.userId,
            nft.organizationId,
            nft.description,
            nft.createdAt
          )
      ),
      total,
    };
  }

  async update(id: string, nft: Partial<NFT>): Promise<NFT> {
    const updatedNFT = await this.prisma.nFT.update({
      where: { id },
      data: nft,
    });
    return new NFT(
      updatedNFT.id,
      updatedNFT.userId,
      updatedNFT.organizationId,
      updatedNFT.description,
      updatedNFT.createdAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.nFT.delete({ where: { id } });
  }
}
