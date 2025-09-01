import { Request, Response } from "express";
import { NFTController } from "../../../presentation/controllers/nft.controller";
import { CreateNFT } from "../../../use-cases/createNFT";
import { GetNFT } from "../../../use-cases/getNFT";
import { GetNFTByUserId } from "../../../use-cases/getNFTByUserId";
import { DeleteNFT } from "../../../use-cases/deleteNFT";
import {
  NFTNotFoundError,
  NFTValidationError,
  NFTDatabaseError,
  NFTAlreadyMintedError,
} from "../../../domain/exceptions";
// ValidationError is used in the test cases

// Mock use cases
const mockCreateNFTUseCase = {
  execute: jest.fn(),
} as jest.Mocked<CreateNFT>;

const mockGetNFTUseCase = {
  execute: jest.fn(),
} as jest.Mocked<GetNFT>;

const mockGetNFTByUserIdUseCase = {
  execute: jest.fn(),
} as jest.Mocked<GetNFTByUserId>;

const mockDeleteNFTUseCase = {
  execute: jest.fn(),
} as jest.Mocked<DeleteNFT>;

describe("NFTController", () => {
  let nftController: NFTController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    nftController = new NFTController(
      mockCreateNFTUseCase,
      mockGetNFTUseCase,
      mockGetNFTByUserIdUseCase,
      mockDeleteNFTUseCase
    );

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("createNFT", () => {
    const validData = {
      userId: "user-123",
      organizationId: "org-123",
      description: "Test NFT Description",
    };

    beforeEach(() => {
      mockRequest = {
        body: validData,
      };
    });

    it("should create NFT successfully with valid data", async () => {
      const expectedNFT = {
        id: "nft-123",
        userId: validData.userId,
        organizationId: validData.organizationId,
        description: validData.description,
        createdAt: new Date(),
      };

      mockCreateNFTUseCase.execute.mockResolvedValue(expectedNFT);

      await nftController.createNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockCreateNFTUseCase.execute).toHaveBeenCalledWith(validData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedNFT,
        message: "NFT created successfully",
      });
    });

    it("should return 400 when userId is missing", async () => {
      mockRequest.body = { ...validData, userId: "" };

      await nftController.createNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Missing required fields: userId, organizationId, description",
        statusCode: 400,
      });
    });

    it("should return 400 when organizationId is missing", async () => {
      mockRequest.body = { ...validData, organizationId: "" };

      await nftController.createNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Missing required fields: userId, organizationId, description",
        statusCode: 400,
      });
    });

    it("should return 400 when description is missing", async () => {
      mockRequest.body = { ...validData, description: "" };

      await nftController.createNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Missing required fields: userId, organizationId, description",
        statusCode: 400,
      });
    });

    it("should handle NFTValidationError from use case", async () => {
      const validationError = new NFTValidationError("Invalid NFT data");
      mockCreateNFTUseCase.execute.mockRejectedValue(validationError);

      await nftController.createNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid NFT data",
        statusCode: 400,
        details: undefined,
      });
    });

    it("should handle NFTDatabaseError from use case", async () => {
      const dbError = new NFTDatabaseError("Database connection failed");
      mockCreateNFTUseCase.execute.mockRejectedValue(dbError);

      await nftController.createNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "DATABASE_ERROR",
        message: "NFT database operation failed: Database connection failed",
        statusCode: 500,
        details: undefined,
      });
    });
  });

  describe("getNFTById", () => {
    const nftId = "nft-123";

    beforeEach(() => {
      mockRequest = {
        params: { id: nftId },
      };
    });

    it("should return NFT when found", async () => {
      const expectedNFT = {
        id: nftId,
        userId: "user-123",
        organizationId: "org-123",
        description: "Test NFT",
        createdAt: new Date(),
      };

      mockGetNFTUseCase.execute.mockResolvedValue(expectedNFT);

      await nftController.getNFTById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetNFTUseCase.execute).toHaveBeenCalledWith(nftId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedNFT,
        message: "NFT retrieved successfully",
      });
    });

    it("should return 400 when id is missing", async () => {
      mockRequest.params = {};

      await nftController.getNFTById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "VALIDATION_ERROR",
        message: "NFT ID is required",
        statusCode: 400,
      });
    });

    it("should handle NFTNotFoundError from use case", async () => {
      const notFoundError = new NFTNotFoundError(nftId);
      mockGetNFTUseCase.execute.mockRejectedValue(notFoundError);

      await nftController.getNFTById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "NFT_NOT_FOUND",
        message: `NFT with ID ${nftId} not found`,
        statusCode: 404,
      });
    });

    it("should handle NFTValidationError from use case", async () => {
      const validationError = new NFTValidationError("Invalid NFT ID");
      mockGetNFTUseCase.execute.mockRejectedValue(validationError);

      await nftController.getNFTById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid NFT ID",
        statusCode: 400,
        details: undefined,
      });
    });
  });

  describe("getNFTsByUserId", () => {
    const userId = "user-123";

    beforeEach(() => {
      mockRequest = {
        params: { userId },
        query: { page: "1", pageSize: "10" },
      };
    });

    it("should return NFTs when found", async () => {
      const expectedResult = {
        nfts: [
          {
            id: "nft-1",
            userId,
            organizationId: "org-1",
            description: "NFT 1",
            createdAt: new Date(),
          },
          {
            id: "nft-2",
            userId,
            organizationId: "org-2",
            description: "NFT 2",
            createdAt: new Date(),
          },
        ],
        total: 2,
      };

      mockGetNFTByUserIdUseCase.execute.mockResolvedValue(expectedResult);

      await nftController.getNFTsByUserId(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetNFTByUserIdUseCase.execute).toHaveBeenCalledWith(
        userId,
        1,
        10
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedResult,
        message: "NFTs retrieved successfully",
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it("should use default pagination values", async () => {
      mockRequest.query = {};
      const expectedResult = { nfts: [], total: 0 };

      mockGetNFTByUserIdUseCase.execute.mockResolvedValue(expectedResult);

      await nftController.getNFTsByUserId(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockGetNFTByUserIdUseCase.execute).toHaveBeenCalledWith(
        userId,
        1,
        10
      );
    });

    it("should return 400 when userId is missing", async () => {
      mockRequest.params = {};

      await nftController.getNFTsByUserId(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "VALIDATION_ERROR",
        message: "User ID is required",
        statusCode: 400,
      });
    });

    it("should handle NFTValidationError from use case", async () => {
      const validationError = new NFTValidationError("Invalid pagination");
      mockGetNFTByUserIdUseCase.execute.mockRejectedValue(validationError);

      await nftController.getNFTsByUserId(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid pagination",
        statusCode: 400,
        details: undefined,
      });
    });
  });

  describe("deleteNFT", () => {
    const nftId = "nft-123";

    beforeEach(() => {
      mockRequest = {
        params: { id: nftId },
      };
    });

    it("should delete NFT successfully", async () => {
      mockDeleteNFTUseCase.execute.mockResolvedValue();

      await nftController.deleteNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockDeleteNFTUseCase.execute).toHaveBeenCalledWith(nftId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "NFT deleted successfully",
      });
    });

    it("should return 400 when id is missing", async () => {
      mockRequest.params = {};

      await nftController.deleteNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "VALIDATION_ERROR",
        message: "NFT ID is required",
        statusCode: 400,
      });
    });

    it("should handle NFTNotFoundError from use case", async () => {
      const notFoundError = new NFTNotFoundError(nftId);
      mockDeleteNFTUseCase.execute.mockRejectedValue(notFoundError);

      await nftController.deleteNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "NFT_NOT_FOUND",
        message: `NFT with ID ${nftId} not found`,
        statusCode: 404,
      });
    });

    it("should handle NFTValidationError from use case", async () => {
      const validationError = new NFTValidationError("Invalid NFT ID");
      mockDeleteNFTUseCase.execute.mockRejectedValue(validationError);

      await nftController.deleteNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid NFT ID",
        statusCode: 400,
        details: undefined,
      });
    });
  });

  describe("error handling", () => {
    it("should handle unknown errors with 500 status", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const unknownError = new Error("Unknown error");

      mockRequest = { body: {} };
      mockCreateNFTUseCase.execute.mockRejectedValue(unknownError);

      await nftController.createNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        statusCode: 500,
      });

      consoleSpy.mockRestore();
    });

    it("should handle NFTAlreadyMintedError with 409 status", async () => {
      const alreadyMintedError = new NFTAlreadyMintedError("nft-123");
      mockRequest = {
        body: {
          userId: "user-123",
          organizationId: "org-123",
          description: "test",
        },
      };
      mockCreateNFTUseCase.execute.mockRejectedValue(alreadyMintedError);

      await nftController.createNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "NFT_ALREADY_MINTED",
        message: "NFT with ID nft-123 is already minted",
        statusCode: 409,
      });
    });

    it("should handle NFTMintingError with 500 status", async () => {
      const mintingError = new NFTMintingError("Smart contract error");
      mockRequest = {
        body: {
          userId: "user-123",
          organizationId: "org-123",
          description: "test",
        },
      };
      mockCreateNFTUseCase.execute.mockRejectedValue(mintingError);

      await nftController.createNFT(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "MINTING_ERROR",
        message: "NFT minting failed: Smart contract error",
        statusCode: 500,
        details: undefined,
      });
    });
  });
});
