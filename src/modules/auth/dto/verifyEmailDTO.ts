import { IsString, IsNotEmpty } from "class-validator";

export class VerifyEmailDTO {
  @IsString()
  @IsNotEmpty()
  token: string;
}
