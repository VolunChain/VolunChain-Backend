import { IsString, IsEmail, IsNotEmpty } from "class-validator";
import { ILoginRequestDto } from "./interfaces/request/login.request";

// Class-based DTO with validation
export class LoginDto implements ILoginRequestDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @IsString({ message: "Password must be a string" })
  @IsNotEmpty({ message: "Password is required" })
  password: string;
}
