import { IsString, IsNotEmpty } from "class-validator";

export class TokenDto {
  @IsString({ message: "Token must be a string" })
  @IsNotEmpty({ message: "Token is required" })
  token: string;
}
