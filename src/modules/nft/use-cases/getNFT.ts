import { INFTRepository } from "../repositories/INFTRepository";
import { NFTNotFoundError, NFTValidationError } from "../domain/exceptions";

export class GetNFT {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(id: string) {
    if (!id || id.trim().length === 0) {
      throw new NFTValidationError("NFT ID is required");
    }

    const nft = await this.nftRepository.findById(id);

    if (!nft) {
      throw new NFTNotFoundError(id);
    }

    return nft;
  }
}
