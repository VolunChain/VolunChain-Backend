import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "ID must be a string" })
  id?: string;

  @IsOptional()
  @IsString({ message: "Name must be a string" })
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  @MaxLength(50, { message: "Name cannot exceed 50 characters" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Last name must be a string" })
  @MinLength(2, { message: "Last name must be at least 2 characters long" })
  @MaxLength(50, { message: "Last name cannot exceed 50 characters" })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: "Please provide a valid email address" })
  email?: string;

  @IsOptional()
  @IsString({ message: "Password must be a string" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(128, { message: "Password cannot exceed 128 characters" })
  password?: string;

  @IsOptional()
  @IsString({ message: "Wallet address must be a string" })
  @MinLength(56, {
    message: "Stellar wallet address must be 56 characters long",
  })
  @MaxLength(56, {
    message: "Stellar wallet address must be 56 characters long",
  })
  @Matches(/^G[A-Z2-7]{55}$/, {
    message: "Invalid Stellar wallet address format",
  })
  wallet?: string;
}
