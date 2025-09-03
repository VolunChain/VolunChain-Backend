import { Request, Response } from "express";
import { Request, Response } from 'express';
import { prepareClaimTx } from '../../use-cases/prepareClaimTx.use-case';
import { submitSignedClaim } from '../../use-cases/submitSignedClaim.use-case';

export class NFTController {
  static async prepareClaim(req: Request, res: Response) {
    // TODO(security): Validar que el usuario autenticado puede reclamar el NFT.
    const { nftId, claimantPublicKey } = req.body;
    const result = await prepareClaimTx({ nftId, claimantPublicKey });
    res.status(200).json(result);
  }

  static async submitClaim(req: Request, res: Response) {
    const { nftId, signedXdr } = req.body;
    const result = await submitSignedClaim({ nftId, signedXdr });
    res.status(202).json(result);
  }
}

export default new NFTController();