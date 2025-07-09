import { Request, Response } from "express";
import NFTService from "../../../../modules/nft/application/services/NFTService";
class NFTController {
  // Creates_a_new_NFT_and_returns_the_created_NFT_data_OKK!!
  async createNFT(req: Request, res: Response) {
    try {
      const nft = await NFTService.createNFT(req.body);
      res.status(201).json(nft);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
  // Fetches_an_NFT_by_its_ID_OKK!!
  async getNFTById(req: Request, res: Response) {
    try {
      const nft = await NFTService.getNFTById(req.params.id);
      if (nft) {
        res.json(nft);
      } else {
        res.status(404).json({ error: "NFT not found" });
      }
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Retrieves_all_NFTs_owned_by_a_specific_user_OKK!!
  async getNFTsByUserId(req: Request, res: Response) {
    try {
      const nfts = await NFTService.getNFTsByUserId(req.params.userId);
      res.json(nfts);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // delete_NFTs_by_a_specific_NFT_id_OKK!!
  async deleteNFT(req: Request, res: Response) {
    try {
      await NFTService.DeleteNFT(req.params.id);
      res.json(`succefully delete NFT ${req.params.id}`);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}

export default new NFTController();
