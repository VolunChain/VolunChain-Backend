import { IsString, MinLength, MaxLength } from "class-validator";

export class LoginDto {
  @IsString({ message: "Wallet address must be a string" })
  @MinLength(56, {
    message: "Stellar wallet address must be 56 characters long",
  })
  @MaxLength(56, {
    message: "Stellar wallet address must be 56 characters long",
  })
  walletAddress: string;
}
