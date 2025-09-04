import { INFTRepository } from "../repositorys/INFTRepository";

export class GetNFTUseCase {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(id: string) {
    return await this.nftRepository.findById(id);
  }
}
