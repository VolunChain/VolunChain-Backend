import { IsInt } from "class-validator";

export class DeletePhotoDto {
  @IsInt({ message: "Photo ID must be an integer" })
  id!: number;
}
