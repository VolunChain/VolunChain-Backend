import { INFTRepository } from "../repositories/INFTRepository";
import { NFTValidationError } from "../domain/exceptions";

export class GetNFTByUserId {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(id: string, page: number, pageSize: number) {
    if (!id || id.trim().length === 0) {
      throw new NFTValidationError("User ID is required");
    }

    if (page < 1) {
      throw new NFTValidationError("Page number must be greater than 0");
    }

    if (pageSize < 1 || pageSize > 100) {
      throw new NFTValidationError("Page size must be between 1 and 100");
    }

    return await this.nftRepository.findByUserId(id, page, pageSize);
  }
}
