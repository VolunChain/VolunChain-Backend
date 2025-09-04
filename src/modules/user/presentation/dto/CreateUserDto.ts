import { IsStellarPublicKey } from "@/shared/validators/StellarPublicKey";
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
} from "class-validator";

export class CreateUserDto {
  @IsString({ message: "Name must be a string" })
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  @MaxLength(50, { message: "Name cannot exceed 50 characters" })
  name: string;

  @IsString({ message: "Last name must be a string" })
  @MinLength(2, { message: "Last name must be at least 2 characters long" })
  @MaxLength(50, { message: "Last name cannot exceed 50 characters" })
  lastName: string;

  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(128, { message: "Password cannot exceed 128 characters" })
  password: string;

  @IsOptional()
  @IsStellarPublicKey()
  wallet: string;
}
