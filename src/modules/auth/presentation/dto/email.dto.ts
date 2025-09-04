import { IsEmail, IsNotEmpty } from "class-validator";

export class EmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
