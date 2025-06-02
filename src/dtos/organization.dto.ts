import { IsString, IsEmail, IsNotEmpty, IsOptional, IsUUID, MinLength, IsEthereumAddress } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  wallet: string;
}

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEthereumAddress()
  @IsOptional()
  wallet?: string;
}

export class GetOrganizationByIdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class GetOrganizationByEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
} 