import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCertificateDto {
  @IsDateString()
  @IsNotEmpty()
  eventDate: string;

  @IsString()
  @IsNotEmpty()
  organizationSignature: string;

  @IsString()
  @IsNotEmpty()
  customMessage: string;
}

export class GetCertificateByIdDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsBoolean()
  direct?: boolean;
}

export class DownloadCertificateDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsBoolean()
  direct?: boolean;
} 