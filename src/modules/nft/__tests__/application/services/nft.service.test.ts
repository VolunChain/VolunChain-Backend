import { NFTService } from "../../../application/services/nft.service";
import { INFTRepository } from "../../../domain/interfaces/nft.interface";
import { NFTDomain as NFT } from "../../../domain/entities/nft.entity";
import {
  NFTNotFoundError,
  NFTValidationError,
  NFTDatabaseError,
  NFTAlreadyMintedError,
} from "../../../domain/exceptions";

// Mock repository
const mockNFTRepository: jest.Mocked<INFTRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe("NFTService", () => {
  let nftService: NFTService;

  beforeEach(() => {
    jest.clearAllMocks();
    nftService = new NFTService(mockNFTRepository);
  });

  describe("createNFT", () => {
    const validData = {
      userId: "user-123",
      organizationId: "org-123",
      description: "Test NFT Description",
    };

    it("should create NFT successfully with valid data", async () => {
      const expectedNFT = new NFT(
        "nft-123",
        validData.userId,
        validData.organizationId,
        validData.description,
        new Date()
      );

      mockNFTRepository.create.mockResolvedValue(expectedNFT);

      const result = await nftService.createNFT(validData);

      expect(result).toEqual(expectedNFT);
      expect(mockNFTRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: validData.userId,
          organizationId: validData.organizationId,
          description: validData.description,
        })
      );
    });

    it("should throw NFTValidationError when userId is missing", async () => {
      const invalidData = { ...validData, userId: "" };

      await expect(nftService.createNFT(invalidData)).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.create).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when organizationId is missing", async () => {
      const invalidData = { ...validData, organizationId: "" };

      await expect(nftService.createNFT(invalidData)).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.create).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when description is missing", async () => {
      const invalidData = { ...validData, description: "" };

      await expect(nftService.createNFT(invalidData)).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.create).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when description is empty", async () => {
      const invalidData = { ...validData, description: "   " };

      await expect(nftService.createNFT(invalidData)).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.create).not.toHaveBeenCalled();
    });

    it("should throw NFTDatabaseError when repository create fails", async () => {
      const dbError = new Error("Database connection failed");
      mockNFTRepository.create.mockRejectedValue(dbError);

      await expect(nftService.createNFT(validData)).rejects.toThrow(
        NFTDatabaseError
      );
    });
  });

  describe("getNFTById", () => {
    const nftId = "nft-123";
    const expectedNFT = new NFT(
      nftId,
      "user-123",
      "org-123",
      "Test NFT",
      new Date()
    );

    it("should return NFT when found", async () => {
      mockNFTRepository.findById.mockResolvedValue(expectedNFT);

      const result = await nftService.getNFTById(nftId);

      expect(result).toEqual(expectedNFT);
      expect(mockNFTRepository.findById).toHaveBeenCalledWith(nftId);
    });

    it("should throw NFTValidationError when id is missing", async () => {
      await expect(nftService.getNFTById("")).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when id is empty", async () => {
      await expect(nftService.getNFTById("   ")).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw NFTNotFoundError when NFT is not found", async () => {
      mockNFTRepository.findById.mockResolvedValue(null);

      await expect(nftService.getNFTById(nftId)).rejects.toThrow(
        NFTNotFoundError
      );
    });

    it("should throw NFTDatabaseError when repository findById fails", async () => {
      const dbError = new Error("Database connection failed");
      mockNFTRepository.findById.mockRejectedValue(dbError);

      await expect(nftService.getNFTById(nftId)).rejects.toThrow(
        NFTDatabaseError
      );
    });
  });

  describe("getNFTsByUserId", () => {
    const userId = "user-123";
    const expectedResult = {
      nfts: [
        new NFT("nft-1", userId, "org-1", "NFT 1", new Date()),
        new NFT("nft-2", userId, "org-2", "NFT 2", new Date()),
      ],
      total: 2,
    };

    it("should return NFTs when found", async () => {
      mockNFTRepository.findByUserId.mockResolvedValue(expectedResult);

      const result = await nftService.getNFTsByUserId(userId, 1, 10);

      expect(result).toEqual(expectedResult);
      expect(mockNFTRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        1,
        10
      );
    });

    it("should use default pagination values", async () => {
      mockNFTRepository.findByUserId.mockResolvedValue(expectedResult);

      await nftService.getNFTsByUserId(userId);

      expect(mockNFTRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        1,
        10
      );
    });

    it("should throw NFTValidationError when userId is missing", async () => {
      await expect(nftService.getNFTsByUserId("")).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.findByUserId).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when page is less than 1", async () => {
      await expect(nftService.getNFTsByUserId(userId, 0, 10)).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.findByUserId).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when pageSize is less than 1", async () => {
      await expect(nftService.getNFTsByUserId(userId, 1, 0)).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.findByUserId).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when pageSize is greater than 100", async () => {
      await expect(nftService.getNFTsByUserId(userId, 1, 101)).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.findByUserId).not.toHaveBeenCalled();
    });

    it("should throw NFTDatabaseError when repository findByUserId fails", async () => {
      const dbError = new Error("Database connection failed");
      mockNFTRepository.findByUserId.mockRejectedValue(dbError);

      await expect(nftService.getNFTsByUserId(userId, 1, 10)).rejects.toThrow(
        NFTDatabaseError
      );
    });
  });

  describe("deleteNFT", () => {
    const nftId = "nft-123";
    const existingNFT = new NFT(
      nftId,
      "user-123",
      "org-123",
      "Test NFT",
      new Date()
    );

    it("should delete NFT successfully when it exists", async () => {
      mockNFTRepository.findById.mockResolvedValue(existingNFT);
      mockNFTRepository.delete.mockResolvedValue();

      await nftService.deleteNFT(nftId);

      expect(mockNFTRepository.findById).toHaveBeenCalledWith(nftId);
      expect(mockNFTRepository.delete).toHaveBeenCalledWith(nftId);
    });

    it("should throw NFTValidationError when id is missing", async () => {
      await expect(nftService.deleteNFT("")).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.findById).not.toHaveBeenCalled();
      expect(mockNFTRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw NFTNotFoundError when NFT does not exist", async () => {
      mockNFTRepository.findById.mockResolvedValue(null);

      await expect(nftService.deleteNFT(nftId)).rejects.toThrow(
        NFTNotFoundError
      );
      expect(mockNFTRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw NFTDatabaseError when repository findById fails", async () => {
      const dbError = new Error("Database connection failed");
      mockNFTRepository.findById.mockRejectedValue(dbError);

      await expect(nftService.deleteNFT(nftId)).rejects.toThrow(
        NFTDatabaseError
      );
    });

    it("should throw NFTDatabaseError when repository delete fails", async () => {
      mockNFTRepository.findById.mockResolvedValue(existingNFT);
      const dbError = new Error("Database connection failed");
      mockNFTRepository.delete.mockRejectedValue(dbError);

      await expect(nftService.deleteNFT(nftId)).rejects.toThrow(
        NFTDatabaseError
      );
    });
  });

  describe("mintNFT", () => {
    const nftId = "nft-123";
    const tokenId = "token-123";
    const contractAddress = "0x123456789";
    const metadataUri = "https://metadata.uri";
    const existingNFT = new NFT(
      nftId,
      "user-123",
      "org-123",
      "Test NFT",
      new Date()
    );

    it("should mint NFT successfully", async () => {
      mockNFTRepository.findById.mockResolvedValue(existingNFT);
      mockNFTRepository.update.mockResolvedValue({
        ...existingNFT,
        tokenId,
        contractAddress,
        metadataUri,
        isMinted: true,
      });

      const result = await nftService.mintNFT(
        nftId,
        tokenId,
        contractAddress,
        metadataUri
      );

      expect(result.isMinted).toBe(true);
      expect(result.tokenId).toBe(tokenId);
      expect(result.contractAddress).toBe(contractAddress);
      expect(result.metadataUri).toBe(metadataUri);
      expect(mockNFTRepository.update).toHaveBeenCalledWith(nftId, {
        tokenId,
        contractAddress,
        metadataUri,
        isMinted: true,
      });
    });

    it("should mint NFT without metadata URI", async () => {
      mockNFTRepository.findById.mockResolvedValue(existingNFT);
      mockNFTRepository.update.mockResolvedValue({
        ...existingNFT,
        tokenId,
        contractAddress,
        isMinted: true,
      });

      const result = await nftService.mintNFT(nftId, tokenId, contractAddress);

      expect(result.isMinted).toBe(true);
      expect(result.tokenId).toBe(tokenId);
      expect(result.contractAddress).toBe(contractAddress);
    });

    it("should throw NFTValidationError when id is missing", async () => {
      await expect(
        nftService.mintNFT("", tokenId, contractAddress)
      ).rejects.toThrow(NFTValidationError);
      expect(mockNFTRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when tokenId is missing", async () => {
      await expect(
        nftService.mintNFT(nftId, "", contractAddress)
      ).rejects.toThrow(NFTValidationError);
      expect(mockNFTRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when contractAddress is missing", async () => {
      await expect(nftService.mintNFT(nftId, tokenId, "")).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw NFTNotFoundError when NFT does not exist", async () => {
      mockNFTRepository.findById.mockResolvedValue(null);

      await expect(
        nftService.mintNFT(nftId, tokenId, contractAddress)
      ).rejects.toThrow(NFTNotFoundError);
      expect(mockNFTRepository.update).not.toHaveBeenCalled();
    });

    it("should throw NFTAlreadyMintedError when NFT is already minted", async () => {
      const mintedNFT = { ...existingNFT, isMinted: true };
      mockNFTRepository.findById.mockResolvedValue(mintedNFT);

      await expect(
        nftService.mintNFT(nftId, tokenId, contractAddress)
      ).rejects.toThrow(NFTAlreadyMintedError);
      expect(mockNFTRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("updateNFTMetadata", () => {
    const nftId = "nft-123";
    const metadataUri = "https://new-metadata.uri";
    const existingNFT = new NFT(
      nftId,
      "user-123",
      "org-123",
      "Test NFT",
      new Date()
    );

    it("should update metadata successfully", async () => {
      mockNFTRepository.findById.mockResolvedValue(existingNFT);
      mockNFTRepository.update.mockResolvedValue({
        ...existingNFT,
        metadataUri,
      });

      const result = await nftService.updateNFTMetadata(nftId, metadataUri);

      expect(result.metadataUri).toBe(metadataUri);
      expect(mockNFTRepository.update).toHaveBeenCalledWith(nftId, {
        metadataUri,
      });
    });

    it("should throw NFTValidationError when id is missing", async () => {
      await expect(
        nftService.updateNFTMetadata("", metadataUri)
      ).rejects.toThrow(NFTValidationError);
      expect(mockNFTRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when metadataUri is missing", async () => {
      await expect(nftService.updateNFTMetadata(nftId, "")).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw NFTValidationError when metadataUri is empty", async () => {
      await expect(nftService.updateNFTMetadata(nftId, "   ")).rejects.toThrow(
        NFTValidationError
      );
      expect(mockNFTRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw NFTNotFoundError when NFT does not exist", async () => {
      mockNFTRepository.findById.mockResolvedValue(null);

      await expect(
        nftService.updateNFTMetadata(nftId, metadataUri)
      ).rejects.toThrow(NFTNotFoundError);
      expect(mockNFTRepository.update).not.toHaveBeenCalled();
    });
  });
});
