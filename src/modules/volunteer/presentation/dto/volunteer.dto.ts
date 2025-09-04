import {
  IsString,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
} from "class-validator";

export class CreateVolunteerDTO {
  @IsString({ message: "Name must be a string" })
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @MaxLength(200, { message: "Name cannot exceed 200 characters" })
  name: string;

  @IsString({ message: "Description must be a string" })
  @MinLength(10, { message: "Description must be at least 10 characters long" })
  @MaxLength(2000, { message: "Description cannot exceed 2000 characters" })
  description: string;

  @IsString({ message: "Requirements must be a string" })
  @MinLength(10, {
    message: "Requirements must be at least 10 characters long",
  })
  @MaxLength(1000, { message: "Requirements cannot exceed 1000 characters" })
  requirements: string;

  @IsOptional()
  @IsString({ message: "Incentive must be a string" })
  @MaxLength(500, { message: "Incentive cannot exceed 500 characters" })
  incentive?: string;

  @IsUUID(4, { message: "Project ID must be a valid UUID" })
  projectId: string;
}

export class UpdateVolunteerDTO {
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @MaxLength(200, { message: "Name cannot exceed 200 characters" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @MinLength(10, { message: "Description must be at least 10 characters long" })
  @MaxLength(2000, { message: "Description cannot exceed 2000 characters" })
  description?: string;

  @IsOptional()
  @IsString({ message: "Requirements must be a string" })
  @MinLength(10, {
    message: "Requirements must be at least 10 characters long",
  })
  @MaxLength(1000, { message: "Requirements cannot exceed 1000 characters" })
  requirements?: string;

  @IsOptional()
  @IsString({ message: "Incentive must be a string" })
  @MaxLength(500, { message: "Incentive cannot exceed 500 characters" })
  incentive?: string;
}

export interface VolunteerResponseDTO {
  id: string;
  name: string;
  description: string;
  requirements: string;
  incentive?: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}
