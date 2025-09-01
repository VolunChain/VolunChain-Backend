import {
  ResourceNotFoundError,
  ResourceConflictError,
  ValidationError,
  DatabaseError,
  InternalServerError,
} from "../../../shared/application/errors/common.errors";

export class NFTNotFoundError extends ResourceNotFoundError {
  constructor(nftId: string) {
    super(`NFT with ID ${nftId} not found`);
  }
}

export class NFTAlreadyMintedError extends ResourceConflictError {
  constructor(nftId: string) {
    super(`NFT with ID ${nftId} is already minted`);
  }
}

export class NFTValidationError extends ValidationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class NFTDatabaseError extends DatabaseError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`NFT database operation failed: ${message}`, details);
  }
}

export class NFTMintingError extends InternalServerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`NFT minting failed: ${message}`, details);
  }
}

export class NFTMetadataError extends ValidationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`NFT metadata error: ${message}`, details);
  }
}
