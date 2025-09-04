import { INFTRepository } from "../application/repositories/INFTRepository";

export class DeleteNFT {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(id: string) {
    return await this.nftRepository.delete(id);
  }
}
