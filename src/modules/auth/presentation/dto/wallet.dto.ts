import { IsStellarPublicKey } from "@/shared/validators/StellarPublicKey";
import { IsString } from "class-validator";

export class WalletDto {
  @IsString({ message: "Wallet address must be a string" })
  @IsStellarPublicKey()
  walletAddress: string;

  @IsString({ message: "Signature must be a base64 string" })
  signature: string;

  @IsString({ message: "Message must be provided" })
  message: string;
}
