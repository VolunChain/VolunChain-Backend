import { Request, Response } from "express";
import { CreateNFT } from "../../use-cases/createNFT";
import { GetNFT } from "../../use-cases/getNFT";
import { GetNFTByUserId } from "../../use-cases/getNFTByUserId";
import { DeleteNFT } from "../../use-cases/deleteNFT";
import {
  NFTNotFoundError,
  NFTValidationError,
  NFTDatabaseError,
  NFTAlreadyMintedError,
  NFTMintingError,
  NFTMetadataError,
} from "../../domain/exceptions";
import {
  ValidationError,
  ResourceNotFoundError,
  ResourceConflictError,
  DatabaseError,
} from "../../../shared/application/errors/common.errors";

export class NFTController {
  constructor(
    private readonly createNFTUseCase: CreateNFT,
    private readonly getNFTUseCase: GetNFT,
    private readonly getNFTByUserIdUseCase: GetNFTByUserId,
    private readonly deleteNFTUseCase: DeleteNFT
  ) {}

  async createNFT(req: Request, res: Response): Promise<void> {
    try {
      const { userId, organizationId, description } = req.body;

      if (!userId || !organizationId || !description) {
        throw new ValidationError(
          "Missing required fields: userId, organizationId, description"
        );
      }

      const nft = await this.createNFTUseCase.execute({
        userId,
        organizationId,
        description,
      });

      res.status(201).json({
        success: true,
        data: nft,
        message: "NFT created successfully",
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getNFTById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ValidationError("NFT ID is required");
      }

      const nft = await this.getNFTUseCase.execute(id);

      res.status(200).json({
        success: true,
        data: nft,
        message: "NFT retrieved successfully",
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getNFTsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      if (!userId) {
        throw new ValidationError("User ID is required");
      }

      const result = await this.getNFTByUserIdUseCase.execute(
        userId,
        page,
        pageSize
      );

      res.status(200).json({
        success: true,
        data: result,
        message: "NFTs retrieved successfully",
        pagination: {
          page,
          pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / pageSize),
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteNFT(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ValidationError("NFT ID is required");
      }

      await this.deleteNFTUseCase.execute(id);

      res.status(200).json({
        success: true,
        message: "NFT deleted successfully",
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    // Map domain exceptions to appropriate HTTP responses
    if (error instanceof NFTNotFoundError) {
      res.status(404).json({
        success: false,
        error: "NFT_NOT_FOUND",
        message: error.message,
        statusCode: 404,
      });
      return;
    }

    if (error instanceof NFTValidationError) {
      res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: error.message,
        statusCode: 400,
        details: error.details,
      });
      return;
    }

    if (error instanceof NFTAlreadyMintedError) {
      res.status(409).json({
        success: false,
        error: "NFT_ALREADY_MINTED",
        message: error.message,
        statusCode: 409,
      });
      return;
    }

    if (error instanceof NFTDatabaseError) {
      res.status(500).json({
        success: false,
        error: "DATABASE_ERROR",
        message: error.message,
        statusCode: 500,
        details: error.details,
      });
      return;
    }

    if (error instanceof NFTMintingError) {
      res.status(500).json({
        success: false,
        error: "MINTING_ERROR",
        message: error.message,
        statusCode: 500,
        details: error.details,
      });
      return;
    }

    if (error instanceof NFTMetadataError) {
      res.status(400).json({
        success: false,
        error: "METADATA_ERROR",
        message: error.message,
        statusCode: 400,
        details: error.details,
      });
      return;
    }

    // Handle other domain exceptions
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: error.message,
        statusCode: 400,
        details: error.details,
      });
      return;
    }

    if (error instanceof ResourceNotFoundError) {
      res.status(404).json({
        success: false,
        error: "RESOURCE_NOT_FOUND",
        message: error.message,
        statusCode: 404,
      });
      return;
    }

    if (error instanceof ResourceConflictError) {
      res.status(409).json({
        success: false,
        error: "RESOURCE_CONFLICT",
        message: error.message,
        statusCode: 409,
      });
      return;
    }

    if (error instanceof DatabaseError) {
      res.status(500).json({
        success: false,
        error: "DATABASE_ERROR",
        message: error.message,
        statusCode: 500,
        details: error.details,
      });
      return;
    }

    // Handle unknown errors
    console.error("Unhandled error in NFT controller:", error);
    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      statusCode: 500,
    });
  }
}
