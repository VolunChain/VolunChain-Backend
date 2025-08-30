import { IsInt } from "class-validator";

export class GetPhotoDto {
  @IsInt({ message: "Photo ID must be an integer" })
  id!: number;
}
