import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { validateDto } from "@/shared/middleware/validation.middleware";

import {
  CreateNFTUseCase,
  DeleteNFTUseCase,
  GetNFTByUserIdUseCase,
  GetNFTUseCase,
} from "../../application/use-cases";

import { CreateNFTDto, UpdateNFTDto } from "../dto";

export class NFTController {
  constructor(
    private readonly createNFTUseCase: CreateNFTUseCase,
    private readonly deleteNFTUseCase: DeleteNFTUseCase,
    private readonly getNFTByUserIdUseCase: GetNFTByUserIdUseCase,
    private readonly getNFTUseCase: GetNFTUseCase
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const dto = await validateDto(CreateNFTDto);
    if (!dto) return;

    try {
      const nft = await this.createNFTUseCase.execute({
        ...req.body,
      });
      res.status(201).json(nft);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create NFT";
      res.status(500).json({ error: message });
    }
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const dto = await validateDto(UpdateNFTDto);
    if (!dto) return;

    try {
      await this.deleteNFTUseCase.execute(req.body.id);
      res.status(200).json({ message: "NFT deleted successfully" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete NFT";
      res.status(500).json({ error: message });
    }
  });

  getNFTById = asyncHandler(async (req: Request, res: Response) => {
    const NFTId = typeof req.params.id === "string" ? req.params.id : undefined;

    if (!NFTId) {
      res.status(400).json({ error: "NFT ID is required" });
      return;
    }
    try {
      const nfts = await this.getNFTUseCase.execute(NFTId);
      res.status(200).json(nfts);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch NFTs";
      res.status(500).json({ error: message });
    }
  });

  getNftByUserid = asyncHandler(async (req: Request, res: Response) => {
    const userId =
      typeof req.params.id === "string" ? req.params.id : undefined;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    try {
      const nft = await this.getNFTByUserIdUseCase.execute(
        userId,
        req.body.page,
        req.body.pageSize
      );
      if (!nft) {
        res.status(404).json({ error: "NFT not found for user" });
        return;
      }
      res.status(200).json(nft);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch NFT by userId";
      res.status(500).json({ error: message });
    }
  });
}
