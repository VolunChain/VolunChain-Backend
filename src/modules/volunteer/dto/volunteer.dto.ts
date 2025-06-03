import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateVolunteerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  requirements: string;

  @IsString()
  @IsOptional()
  incentive?: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}

export class UpdateVolunteerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  incentive?: string;
}

export class GetVolunteerByIdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class GetVolunteersByProjectDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;
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
