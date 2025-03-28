import { Router } from "express";
import NFTController from "../controllers/NFTController";
import { body } from "express-validator";

const router = Router();

router.post(
  "/nfts",
  [
    body("userId").isUUID(),
    body("organizationId").isUUID(),
    body("description").isString().notEmpty(),
  ],
  NFTController.createNFT
);

router.get("/nfts/:id", NFTController.getNFTById);
router.get("/users/:userId/nfts", NFTController.getNFTsByUserId);

export default router;
