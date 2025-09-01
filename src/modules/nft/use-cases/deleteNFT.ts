import { INFTRepository } from "../repositories/INFTRepository";
import { NFTNotFoundError, NFTValidationError } from "../domain/exceptions";

export class DeleteNFT {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(id: string) {
    if (!id || id.trim().length === 0) {
      throw new NFTValidationError("NFT ID is required");
    }

    // Check if NFT exists before deleting
    const existingNFT = await this.nftRepository.findById(id);
    if (!existingNFT) {
      throw new NFTNotFoundError(id);
    }

    return await this.nftRepository.delete(id);
  }
}
