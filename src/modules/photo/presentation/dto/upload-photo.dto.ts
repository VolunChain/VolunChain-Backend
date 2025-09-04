import { IsInt } from "class-validator";

export class UploadPhotoDto {
  @IsInt({ message: "userId must be an integer" })
  userId!: number;
}
