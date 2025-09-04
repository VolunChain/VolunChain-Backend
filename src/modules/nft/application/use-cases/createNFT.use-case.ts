import { INFTRepository } from "../repositorys/INFTRepository";
import { NFTEntity } from "../../domain/entities/nft.entity";
import { CreateNFTDto } from "../../presentation/dto/CreateNFT.dto";

export class CreateNFTUseCase {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(data: CreateNFTDto): Promise<NFTEntity> {
    return await this.nftRepository.create({
      id: data.id,
      description: data.description,
      createdAt: new Date(),
      isMinted: data.isMinted ?? false,
      metadataUri: data.metadataUri,
      organizationId: data.organizationId,
      tokenId: data.tokenId,
      userId: data.userId,
    });
  }
}
