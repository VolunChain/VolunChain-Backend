import { IPhotoMetadata } from "@/modules/photo/domain/entities/interfaces/photo.interface";
import { PhotoEntity } from "@/modules/photo/domain/entities/photo.entity";

export interface IPhotoServiceAdapter {
  upload(
    file: Express.Multer.File,
    userId: string,
    metadata?: IPhotoMetadata
  ): Promise<PhotoEntity>;
  getById(photoId: string): Promise<{ id: string; url: string } | null>;
  delete(photoUrl: string): Promise<void>;
  updateMetadata(
    photoId: string,
    metadata: IPhotoMetadata
  ): Promise<IPhotoMetadata>;
}
