import { INFTRepository } from "../repositorys/INFTRepository";

export class DeleteNFTUseCase {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(id: string) {
    return await this.nftRepository.delete(id);
  }
}
