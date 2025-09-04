import { PrismaClient } from "@prisma/client";
import { INFTRepository } from "../../application/repositorys/INFTRepository";
import { NFTEntity } from "../../domain/entities/nft.entity";
import { UpdateNFTDto, CreateNFTDto } from "../../presentation/dto";
import { INFT } from "../../domain/interfaces/nft.interface";

export class NFTRepository implements INFTRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(nft: CreateNFTDto): Promise<NFTEntity> {
    const newNFT: INFT = await this.prisma.NFT.create({
      data: {
        description: nft.description,
        isMinted: nft.isMinted ?? false,
        metadataUri: nft.metadataUri,
        tokenId: nft.tokenId,
        userId: nft.userId,
        organizationId: nft.organizationId,
      },
    });

    return NFTEntity.create(newNFT);
  }

  async findById(id: string): Promise<NFTEntity | null> {
    const nft = await this.prisma.NFT.findUnique({ where: { id } });
    return nft ? NFTEntity.create(nft) : null;
  }

  async findByUserId(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ nfts: NFTEntity[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const [nfts, total] = await Promise.all([
      this.prisma.NFT.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.NFT.count({ where: { userId } }),
    ]);

    return {
      nfts: nfts.map((nft: INFT) => NFTEntity.create(nft)),
      total,
    };
  }

  async update(id: string, nft: Partial<UpdateNFTDto>): Promise<NFTEntity> {
    const updatedNFT = await this.prisma.NFT.update({
      where: { id },
      data: nft,
    });

    return NFTEntity.create(updatedNFT);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.NFT.delete({ where: { id } });
  }
}
