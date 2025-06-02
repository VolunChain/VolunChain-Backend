import { IsString, IsEmail, MinLength, IsNotEmpty, IsEthereumAddress } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  wallet: string;
}

export class LoginDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  walletAddress: string;
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ResendVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
} 