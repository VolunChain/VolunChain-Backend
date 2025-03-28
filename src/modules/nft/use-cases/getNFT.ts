import { INFTRepository } from "../repositories/INFTRepository";

export class GetNFT {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(id: string) {
    return await this.nftRepository.findById(id);
  }
}
