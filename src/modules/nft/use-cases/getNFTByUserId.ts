import { INFTRepository } from "../application/repositories/INFTRepository";

export class GetNFTByUserId {
  constructor(private readonly nftRepository: INFTRepository) {}

  async execute(id: string, page: number, pageSize: number) {
    return await this.nftRepository.findByUserId(id, page, pageSize);
  }
}
