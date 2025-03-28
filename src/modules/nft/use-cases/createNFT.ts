import { INFTRepository } from "../repositories/INFTRepository";
import { NFT } from "../domain/entities/nft.entity";
import { CreateNFTDto } from "../dto/create-nft.dto";

export class CreateNFT {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(data: CreateNFTDto): Promise<NFT> {
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
