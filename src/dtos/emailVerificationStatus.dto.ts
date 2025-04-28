import { IsBoolean, IsString } from "class-validator";

export class EmailVerificationStatusDTO {
  @IsBoolean()
  isVerified: boolean;

  @IsString()
  message: string;
}