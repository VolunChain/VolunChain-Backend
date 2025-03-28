import { IsString } from "class-validator";

export class VerifyEmailDTO {
  @IsString()
  token: string;
}
