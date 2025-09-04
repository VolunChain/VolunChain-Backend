import {
  IsString,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
} from "class-validator";
import { ProjectStatus } from "../domain/Project";

export class UpdateProjectDto {
  @IsOptional()
  @IsString({ message: "Title must be a string" })
  @MinLength(3, { message: "Title must be at least 3 characters long" })
  @MaxLength(200, { message: "Title cannot exceed 200 characters" })
  title?: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  @MinLength(10, { message: "Description must be at least 10 characters long" })
  @MaxLength(2000, { message: "Description cannot exceed 2000 characters" })
  description?: string;

  @IsOptional()
  @IsUUID(4, { message: "Organization ID must be a valid UUID" })
  organizationId?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { message: "Status must be a valid project status" })
  status?: ProjectStatus;
}
