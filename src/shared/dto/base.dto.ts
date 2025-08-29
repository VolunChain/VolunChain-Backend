import { IsUUID, IsOptional, IsInt, Min, IsString } from "class-validator";
import { Transform } from "class-transformer";
export class UuidParamsDto {
  @IsUUID(4, { message: "ID must be a valid UUID" })
  id!: string;
}

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: "Page must be an integer" })
  @Min(1, { message: "Page must be at least 1" })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: "Limit must be an integer" })
  @Min(1, { message: "Limit must be at least 1" })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: "Search must be a string" })
  search?: string;
}

export class BaseResponseDto {
  success: boolean;
  message?: string;
}

export class ErrorResponseDto {
  success: false;
  error: string;
  details?: Array<{
    property: string;
    value: unknown;
    constraints: string[];
  }>;
}
