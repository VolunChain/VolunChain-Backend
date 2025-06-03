import { IsString, IsNotEmpty, IsUUID, IsOptional, IsEthereumAddress } from 'class-validator';

export class CreateNFTDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  ownerAddress: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class GetNFTByIdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class GetNFTsByUserIdDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class DeleteNFTDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
} 