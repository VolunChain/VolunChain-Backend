import { NFTRepository } from "../../repositories/nft.repository";
import { CreateNFT } from "../../use-cases/createNFT";
import { GetNFT } from "../../use-cases/getNFT";
import { GetNFTByUserId } from "../../use-cases/getNFTByUserId";
import { CreateNFTDto } from "../../dto/create-nft.dto";
import { DeleteNFT } from "../../use-cases/deleteNFT";

export class NFTService {
  private nftRepository = new NFTRepository();

  async createNFT(data: CreateNFTDto) {
    if (!data.userId || !data.organizationId || !data.description) {
      throw new Error("missing_required_fields");
    }

    const use_Case = new CreateNFT(this.nftRepository);
    return await use_Case.execute(data);
  }

  async getNFTById(id: string) {
    return await new GetNFT(this.nftRepository).execute(id);
  }

  async getNFTsByUserId(userId: string, page = 1, pageSize = 10) {
    return await new GetNFTByUserId(this.nftRepository).execute(
      userId,
      page,
      pageSize
    );
  }

  async DeleteNFT(id: string) {
    return await new DeleteNFT(this.nftRepository).execute(id);
  }
}

export default new NFTService();
