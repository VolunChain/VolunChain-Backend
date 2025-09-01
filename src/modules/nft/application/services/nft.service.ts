import { INFTRepository } from "../../domain/interfaces/nft.interface";
import { NFTDomain as NFT } from "../../domain/entities/nft.entity";
import { CreateNFTDto } from "../../dto/create-nft.dto";
import {
  NFTNotFoundError,
  NFTValidationError,
  NFTDatabaseError,
  NFTAlreadyMintedError,
  NFTMintingError,
} from "../../domain/exceptions";

export class NFTService {
  constructor(private readonly nftRepository: INFTRepository) {}

  async createNFT(data: CreateNFTDto): Promise<NFT> {
    try {
      // Validate input data
      if (!data.userId || !data.organizationId || !data.description) {
        throw new NFTValidationError(
          "User ID, organization ID, and description are required",
          {
            providedData: data,
          }
        );
      }

      if (data.description.trim().length === 0) {
        throw new NFTValidationError("Description cannot be empty");
      }

      // Create NFT domain object
      const nft = new NFT(
        Date.now().toString(),
        data.userId,
        data.organizationId,
        data.description,
        new Date()
      );

      // Save to repository
      return await this.nftRepository.create(nft);
    } catch (error) {
      if (error instanceof NFTValidationError) {
        throw error;
      }

      if (error instanceof NFTDatabaseError) {
        throw error;
      }

      // Map other errors to domain exceptions
      if (error instanceof Error) {
        throw new NFTDatabaseError(`Failed to create NFT: ${error.message}`, {
          originalError: error.message,
          nftData: data,
        });
      }

      throw new NFTDatabaseError("Failed to create NFT: Unknown error");
    }
  }

  async getNFTById(id: string): Promise<NFT> {
    try {
      if (!id || id.trim().length === 0) {
        throw new NFTValidationError("NFT ID is required");
      }

      const nft = await this.nftRepository.findById(id);

      if (!nft) {
        throw new NFTNotFoundError(id);
      }

      return nft;
    } catch (error) {
      if (
        error instanceof NFTNotFoundError ||
        error instanceof NFTValidationError
      ) {
        throw error;
      }

      if (error instanceof NFTDatabaseError) {
        throw error;
      }

      // Map other errors to domain exceptions
      if (error instanceof Error) {
        throw new NFTDatabaseError(`Failed to get NFT: ${error.message}`, {
          originalError: error.message,
          nftId: id,
        });
      }

      throw new NFTDatabaseError("Failed to get NFT: Unknown error");
    }
  }

  async getNFTsByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ nfts: NFT[]; total: number }> {
    try {
      if (!userId || userId.trim().length === 0) {
        throw new NFTValidationError("User ID is required");
      }

      if (page < 1) {
        throw new NFTValidationError("Page number must be greater than 0");
      }

      if (pageSize < 1 || pageSize > 100) {
        throw new NFTValidationError("Page size must be between 1 and 100");
      }

      return await this.nftRepository.findByUserId(userId, page, pageSize);
    } catch (error) {
      if (error instanceof NFTValidationError) {
        throw error;
      }

      if (error instanceof NFTDatabaseError) {
        throw error;
      }

      // Map other errors to domain exceptions
      if (error instanceof Error) {
        throw new NFTDatabaseError(
          `Failed to get NFTs by user ID: ${error.message}`,
          {
            originalError: error.message,
            userId,
            page,
            pageSize,
          }
        );
      }

      throw new NFTDatabaseError(
        "Failed to get NFTs by user ID: Unknown error"
      );
    }
  }

  async deleteNFT(id: string): Promise<void> {
    try {
      if (!id || id.trim().length === 0) {
        throw new NFTValidationError("NFT ID is required");
      }

      // Check if NFT exists before deleting
      const existingNFT = await this.nftRepository.findById(id);
      if (!existingNFT) {
        throw new NFTNotFoundError(id);
      }

      await this.nftRepository.delete(id);
    } catch (error) {
      if (
        error instanceof NFTNotFoundError ||
        error instanceof NFTValidationError
      ) {
        throw error;
      }

      if (error instanceof NFTDatabaseError) {
        throw error;
      }

      // Map other errors to domain exceptions
      if (error instanceof Error) {
        throw new NFTDatabaseError(`Failed to delete NFT: ${error.message}`, {
          originalError: error.message,
          nftId: id,
        });
      }

      throw new NFTDatabaseError("Failed to delete NFT: Unknown error");
    }
  }

  async mintNFT(
    id: string,
    tokenId: string,
    contractAddress: string,
    metadataUri?: string
  ): Promise<NFT> {
    try {
      if (!id || id.trim().length === 0) {
        throw new NFTValidationError("NFT ID is required");
      }

      if (!tokenId || !contractAddress) {
        throw new NFTValidationError(
          "Token ID and contract address are required for minting"
        );
      }

      // Get existing NFT
      const nft = await this.nftRepository.findById(id);
      if (!nft) {
        throw new NFTNotFoundError(id);
      }

      // Check if already minted
      if (nft.isMinted) {
        throw new NFTAlreadyMintedError(id);
      }

      // Update NFT with minting data
      const updatedNFT = await this.nftRepository.update(id, {
        tokenId,
        contractAddress,
        metadataUri,
        isMinted: true,
      });

      return updatedNFT;
    } catch (error) {
      if (
        error instanceof NFTNotFoundError ||
        error instanceof NFTValidationError ||
        error instanceof NFTAlreadyMintedError
      ) {
        throw error;
      }

      if (error instanceof NFTDatabaseError) {
        throw error;
      }

      // Map other errors to domain exceptions
      if (error instanceof Error) {
        throw new NFTMintingError(`Failed to mint NFT: ${error.message}`, {
          originalError: error.message,
          nftId: id,
          tokenId,
          contractAddress,
        });
      }

      throw new NFTMintingError("Failed to mint NFT: Unknown error");
    }
  }

  async updateNFTMetadata(id: string, metadataUri: string): Promise<NFT> {
    try {
      if (!id || id.trim().length === 0) {
        throw new NFTValidationError("NFT ID is required");
      }

      if (!metadataUri || metadataUri.trim().length === 0) {
        throw new NFTValidationError("Metadata URI cannot be empty");
      }

      // Check if NFT exists
      const existingNFT = await this.nftRepository.findById(id);
      if (!existingNFT) {
        throw new NFTNotFoundError(id);
      }

      // Update metadata
      return await this.nftRepository.update(id, { metadataUri });
    } catch (error) {
      if (
        error instanceof NFTNotFoundError ||
        error instanceof NFTValidationError
      ) {
        throw error;
      }

      if (error instanceof NFTDatabaseError) {
        throw error;
      }

      // Map other errors to domain exceptions
      if (error instanceof Error) {
        throw new NFTDatabaseError(
          `Failed to update NFT metadata: ${error.message}`,
          {
            originalError: error.message,
            nftId: id,
            metadataUri,
          }
        );
      }

      throw new NFTDatabaseError(
        "Failed to update NFT metadata: Unknown error"
      );
    }
  }
}
