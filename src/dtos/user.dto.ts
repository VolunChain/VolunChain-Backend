import { IsString, IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {
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
  @IsNotEmpty()
  wallet: string;
}

export class GetUserByIdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class GetUserByEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
} 