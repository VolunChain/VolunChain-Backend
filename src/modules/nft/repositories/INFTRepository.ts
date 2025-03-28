import { NFT } from "../domain/entities/nft.entity";
import { INFT } from "../domain/interfaces/nft.interface";

export interface INFTRepository {
  create(nft: INFT): Promise<NFT>;
  findById(id: string): Promise<NFT | null>;
  findByUserId(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ nfts: NFT[]; total: number }>;
  update(id: string, nft: Partial<NFT>): Promise<NFT>;
  delete(id: string): Promise<void>;
}
