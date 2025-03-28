import { IsEmail } from "class-validator";

export class ResendVerificationDTO {
  @IsEmail()
  email: string;
}
