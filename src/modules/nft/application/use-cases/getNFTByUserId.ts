import { INFTRepository } from "../repositorys/INFTRepository";

export class GetNFTByUserIdUseCase {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(id: string, page: number, pageSize: number) {
    return await this.nftRepository.findByUserId(id, page, pageSize);
  }
}
