import {
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsDateString,
  IsUUID,
} from "class-validator";

export class UpdateNFTDto {
  @IsOptional()
  @IsUUID("4", { message: "Invalid NFT ID format" })
  id?: string;

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
