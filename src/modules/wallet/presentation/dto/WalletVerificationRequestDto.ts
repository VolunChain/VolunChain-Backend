import { IsString, IsNotEmpty, Matches } from "class-validator";

export class WalletVerificationRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[GC][A-Z2-7]{55}$|^M[A-Z2-7]{68}$/, {
    message:
      "Invalid Stellar wallet address format. Address must start with G or M and be the correct length.",
  })
  walletAddress: string;

  constructor(walletAddress: string) {
    this.walletAddress = walletAddress;
  }
}
