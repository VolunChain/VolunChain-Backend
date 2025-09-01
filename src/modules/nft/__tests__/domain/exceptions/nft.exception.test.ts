import {
  NFTNotFoundError,
  NFTAlreadyMintedError,
  NFTValidationError,
  NFTDatabaseError,
  NFTMintingError,
  NFTMetadataError,
} from "../../../domain/exceptions";

describe("NFT Domain Exceptions", () => {
  describe("NFTNotFoundError", () => {
    it("should create NFTNotFoundError with correct message and status", () => {
      const nftId = "nft-123";
      const error = new NFTNotFoundError(nftId);

      expect(error.message).toBe(`NFT with ID ${nftId} not found`);
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("RESOURCE_NOT_FOUND");
      expect(error.name).toBe("NFTNotFoundError");
    });

    it("should extend ResourceNotFoundError", () => {
      const error = new NFTNotFoundError("test-id");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("NFTAlreadyMintedError", () => {
    it("should create NFTAlreadyMintedError with correct message and status", () => {
      const nftId = "nft-456";
      const error = new NFTAlreadyMintedError(nftId);

      expect(error.message).toBe(`NFT with ID ${nftId} is already minted`);
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("RESOURCE_CONFLICT");
      expect(error.name).toBe("NFTAlreadyMintedError");
    });

    it("should extend ResourceConflictError", () => {
      const error = new NFTAlreadyMintedError("test-id");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("NFTValidationError", () => {
    it("should create NFTValidationError with message only", () => {
      const message = "Invalid NFT data";
      const error = new NFTValidationError(message);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.name).toBe("NFTValidationError");
      expect(error.details).toBeUndefined();
    });

    it("should create NFTValidationError with message and details", () => {
      const message = "Invalid NFT data";
      const details = { field: "description", value: "" };
      const error = new NFTValidationError(message, details);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.details).toEqual(details);
    });

    it("should extend ValidationError", () => {
      const error = new NFTValidationError("test message");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("NFTDatabaseError", () => {
    it("should create NFTDatabaseError with message only", () => {
      const message = "Database connection failed";
      const error = new NFTDatabaseError(message);

      expect(error.message).toBe(`NFT database operation failed: ${message}`);
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("DATABASE_ERROR");
      expect(error.name).toBe("NFTDatabaseError");
      expect(error.details).toBeUndefined();
    });

    it("should create NFTDatabaseError with message and details", () => {
      const message = "Database connection failed";
      const details = { operation: "create", table: "nfts" };
      const error = new NFTDatabaseError(message, details);

      expect(error.message).toBe(`NFT database operation failed: ${message}`);
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("DATABASE_ERROR");
      expect(error.details).toEqual(details);
    });

    it("should extend DatabaseError", () => {
      const error = new NFTDatabaseError("test message");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("NFTMintingError", () => {
    it("should create NFTMintingError with message only", () => {
      const message = "Smart contract error";
      const error = new NFTMintingError(message);

      expect(error.message).toBe(`NFT minting failed: ${message}`);
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("INTERNAL_ERROR");
      expect(error.name).toBe("NFTMintingError");
      expect(error.details).toBeUndefined();
    });

    it("should create NFTMintingError with message and details", () => {
      const message = "Smart contract error";
      const details = { contractAddress: "0x123", gasUsed: "50000" };
      const error = new NFTMintingError(message, details);

      expect(error.message).toBe(`NFT minting failed: ${message}`);
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("INTERNAL_ERROR");
      expect(error.details).toEqual(details);
    });

    it("should extend InternalServerError", () => {
      const error = new NFTMintingError("test message");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("NFTMetadataError", () => {
    it("should create NFTMetadataError with message only", () => {
      const message = "Invalid metadata format";
      const error = new NFTMetadataError(message);

      expect(error.message).toBe(`NFT metadata error: ${message}`);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.name).toBe("NFTMetadataError");
      expect(error.details).toBeUndefined();
    });

    it("should create NFTMetadataError with message and details", () => {
      const message = "Invalid metadata format";
      const details = { format: "JSON", issue: "malformed" };
      const error = new NFTMetadataError(message, details);

      expect(error.message).toBe(`NFT metadata error: ${message}`);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.details).toEqual(details);
    });

    it("should extend ValidationError", () => {
      const error = new NFTMetadataError("test message");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("Error serialization", () => {
    it("should serialize NFTNotFoundError correctly", () => {
      const error = new NFTNotFoundError("nft-123");
      const serialized = error.toJSON();

      expect(serialized).toEqual({
        statusCode: 404,
        message: "NFT with ID nft-123 not found",
        errorCode: "RESOURCE_NOT_FOUND",
      });
    });

    it("should serialize NFTValidationError with details correctly", () => {
      const details = { field: "description" };
      const error = new NFTValidationError("Invalid data", details);
      const serialized = error.toJSON();

      expect(serialized).toEqual({
        statusCode: 400,
        message: "Invalid data",
        errorCode: "VALIDATION_ERROR",
        details,
      });
    });
  });
});
