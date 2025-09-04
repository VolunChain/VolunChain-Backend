import { Router } from "express";

import { NFTController } from "./controllers/NFTController";

import {
  CreateNFTUseCase,
  DeleteNFTUseCase,
  GetNFTByUserIdUseCase,
  GetNFTUseCase,
} from "../application/use-cases";

import { NFTRepository } from "../infrastructure/repositorys/nft.repository";

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();

    //Repository
    const repository = new NFTRepository(prisma);

    const controller = new NFTController(
      new CreateNFTUseCase(repository),
      new DeleteNFTUseCase(repository),
      new GetNFTByUserIdUseCase(repository),
      new GetNFTUseCase(repository)
    );

    router.post("/", controller.create);
    router.delete("/", controller.delete);
    router.get("/getById/:id", controller.getNFTById);
    router.get("/getByUserId/:id", controller.getNftByUserid);

    return router;
  }
}
