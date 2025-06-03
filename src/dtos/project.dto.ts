import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsUUID()
  @IsNotEmpty()
  organizationId: string;
}

export class GetProjectByIdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class GetProjectsByOrganizationDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
} 