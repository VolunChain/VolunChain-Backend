import { INFTRepository } from "../repositories/INFTRepository";
import { NFTDomain as NFT } from "../domain/entities/nft.entity";
import { CreateNFTDto } from "../dto/create-nft.dto";
import { NFTValidationError } from "../domain/exceptions";

export class CreateNFT {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(data: CreateNFTDto): Promise<NFT> {
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

    const nft = new NFT(
      Date.now().toString(),
      data.userId,
      data.organizationId,
      data.description,
      new Date()
    );

    return await this.nftRepository.create(nft);
  }
}
