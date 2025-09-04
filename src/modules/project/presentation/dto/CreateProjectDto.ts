import {
  IsString,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  IsDate,
} from "class-validator";
import { ProjectStatus } from "../../domain/enum/ProjectStatus.enum";
import { Transform } from "class-transformer";

export class CreateProjectDto {
  @IsString({ message: "Name must be a string" })
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @MaxLength(200, { message: "Name cannot exceed 200 characters" })
  name: string;

  @IsString({ message: "Description must be a string" })
  @MinLength(10, { message: "Description must be at least 10 characters long" })
  @MaxLength(2000, { message: "Description cannot exceed 2000 characters" })
  description: string;

  @IsString({ message: "Location must be a string" })
  location: string;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  startDate: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  endDate: Date;

  @IsUUID(4, { message: "Organization ID must be a valid UUID" })
  organizationId: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { message: "Status must be a valid project status" })
  status?: ProjectStatus;
}
