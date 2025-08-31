import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from "class-validator";

export enum ProfileType {
  USER = "user",
  PROJECT = "project",
}

export class RegisterDto {
  @IsString({ message: "Name must be a string" })
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  @MaxLength(100, { message: "Name cannot exceed 100 characters" })
  name: string;

  @IsEmail({}, { message: "Please provide a valid email address" })
  email: string;

  @IsString({ message: "Wallet address must be a string" })
  @MinLength(56, {
    message: "Stellar wallet address must be 56 characters long",
  })
  @MaxLength(56, {
    message: "Stellar wallet address must be 56 characters long",
  })
  walletAddress: string;

  @IsEnum(ProfileType, {
    message: "Profile type must be either 'user' or 'project'",
  })
  profileType: ProfileType;

  @IsOptional()
  @IsString({ message: "Last name must be a string" })
  @MaxLength(100, { message: "Last name cannot exceed 100 characters" })
  lastName?: string;

  @IsOptional()
  @IsString({ message: "Category must be a string" })
  @MaxLength(100, { message: "Category cannot exceed 100 characters" })
  category?: string;
}
