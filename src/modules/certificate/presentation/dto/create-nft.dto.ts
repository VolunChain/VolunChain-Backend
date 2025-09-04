import { IsString, IsUUID, MinLength, MaxLength } from "class-validator";

export class CreateNFTDto {
  @IsUUID(4, { message: "User ID must be a valid UUID" })
  userId: string;

  @IsUUID(4, { message: "Organization ID must be a valid UUID" })
  organizationId: string;

  @IsString({ message: "Description must be a string" })
  @MinLength(10, { message: "Description must be at least 10 characters long" })
  @MaxLength(1000, { message: "Description cannot exceed 1000 characters" })
  description: string;
}
