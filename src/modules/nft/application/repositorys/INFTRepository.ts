import { NFTEntity } from "../../domain/entities/nft.entity";
import { INFT } from "../../domain/interfaces/nft.interface";

export interface INFTRepository {
  create(nft: INFT): Promise<NFTEntity>;
  findById(id: string): Promise<NFTEntity | null>;
  findByUserId(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ nfts: NFTEntity[]; total: number }>;
  update(id: string, nft: Partial<INFT>): Promise<NFTEntity>;
  delete(id: string): Promise<void>;
}
