import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  IsBoolean,
  IsUUID,
  Length,
} from "class-validator";

export class CreateNFTDto {
  @IsOptional()
  @IsUUID("4", { message: "Invalid NFT ID format" })
  id: string;

  @IsString()
  @Length(5, 400)
  description: string;

  @IsOptional()
  @IsUUID("4", { message: "Invalid userId format" })
  userId?: string;

  @IsOptional()
  @IsUUID("4", { message: "Invalid organizationId format" })
  organizationId?: string;

  @IsOptional()
  @IsString({ message: "Token ID must be a string" })
  tokenId?: string;

  @IsOptional()
  @IsUrl({}, { message: "metadataUri must be a valid URL" })
  metadataUri?: string;

  @IsOptional()
  @IsBoolean({ message: "isMinted must be a boolean" })
  isMinted?: boolean;

  @IsOptional()
  @IsDateString({}, { message: "createdAt must be a valid date" })
  createdAt?: Date;
}
