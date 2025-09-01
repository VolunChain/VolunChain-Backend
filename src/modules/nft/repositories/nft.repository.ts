import { PrismaClient } from "@prisma/client";
import { INFTRepository } from "./INFTRepository";
import { NFTDomain as NFT } from "../domain/entities/nft.entity";
import { NFTDatabaseError } from "../domain/exceptions";

// Define our own types based on the Prisma schema
interface PrismaNFT {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  organizationId: string;
  description: string;
}

export class NFTRepository implements INFTRepository {
  private prisma = new PrismaClient();

  async create(nft: NFT): Promise<NFT> {
    try {
      const newNFT = (await this.prisma.nFT.create({
        data: {
          userId: nft.userId,
          organizationId: nft.organizationId,
          description: nft.description,
        },
      })) as unknown as PrismaNFT;

      return new NFT(
        newNFT.id,
        newNFT.userId,
        newNFT.organizationId,
        newNFT.description,
        newNFT.createdAt
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new NFTDatabaseError(`Failed to create NFT: ${error.message}`, {
          originalError: error.message,
          nftData: { userId: nft.userId, organizationId: nft.organizationId },
        });
      }
      throw new NFTDatabaseError("Failed to create NFT: Unknown error");
    }
  }

  async findById(id: string): Promise<NFT | null> {
    try {
      const nft = (await this.prisma.nFT.findUnique({
        where: { id },
      })) as unknown as PrismaNFT | null;
      return nft
        ? new NFT(
            nft.id,
            nft.userId,
            nft.organizationId,
            nft.description,
            nft.createdAt
          )
        : null;
    } catch (error) {
      if (error instanceof Error) {
        throw new NFTDatabaseError(
          `Failed to find NFT by ID: ${error.message}`,
          {
            originalError: error.message,
            nftId: id,
          }
        );
      }
      throw new NFTDatabaseError("Failed to find NFT by ID: Unknown error");
    }
  }

  async findByUserId(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ nfts: NFT[]; total: number }> {
    try {
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
        nfts: (nfts as unknown as PrismaNFT[]).map(
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
    } catch (error) {
      if (error instanceof Error) {
        throw new NFTDatabaseError(
          `Failed to find NFTs by user ID: ${error.message}`,
          {
            originalError: error.message,
            userId,
            page,
            pageSize,
          }
        );
      }
      throw new NFTDatabaseError(
        "Failed to find NFTs by user ID: Unknown error"
      );
    }
  }

  async update(id: string, nft: Partial<NFT>): Promise<NFT> {
    try {
      const updatedNFT = (await this.prisma.nFT.update({
        where: { id },
        data: nft,
      })) as unknown as PrismaNFT;

      return new NFT(
        updatedNFT.id,
        updatedNFT.userId,
        updatedNFT.organizationId,
        updatedNFT.description,
        updatedNFT.createdAt
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new NFTDatabaseError(`Failed to update NFT: ${error.message}`, {
          originalError: error.message,
          nftId: id,
          updateData: nft,
        });
      }
      throw new NFTDatabaseError("Failed to update NFT: Unknown error");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.nFT.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Error) {
        throw new NFTDatabaseError(`Failed to delete NFT: ${error.message}`, {
          originalError: error.message,
          nftId: id,
        });
      }
      throw new NFTDatabaseError("Failed to delete NFT: Unknown error");
    }
  }
}
