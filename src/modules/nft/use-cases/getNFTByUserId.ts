import { INFTRepository } from "../repositories/INFTRepository";

export class GetNFTByUserId {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(id: string, page: number, pageSize: number) {
    return await this.nftRepository.findByUserId(id, page, pageSize);
  }
}
