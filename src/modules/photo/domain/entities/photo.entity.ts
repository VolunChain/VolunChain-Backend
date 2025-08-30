import { BaseEntity } from "../../../shared/domain/entities/base.entity";
import { IPhotoMetadata, IPhotoProps } from "./interfaces/photo.interface";
import {
  InvalidPhotoUrlException,
  MissingUserIdException,
} from "../exceptions/domain.exception";

export class PhotoEntity extends BaseEntity {
  url: string;

  userId: string;

  metadata?: IPhotoMetadata;

  // Domain logic and validation
  protected validate(): boolean {
    if (!this.url || this.url.trim() === "") {
      throw new InvalidPhotoUrlException(this.url);
    }

    if (!/^https?:\/\/.+$/.test(this.url)) {
      throw new InvalidPhotoUrlException(this.url);
    }

    if (!this.userId || this.userId.trim() === "") {
      throw new MissingUserIdException();
    }

    return true;
  }

  // Update metadata
  public updateMetadata(newMetadata: IPhotoMetadata): void {
    this.metadata = {
      ...this.metadata,
      ...newMetadata,
    };
  }

  // Static factory method
  public static create(props: IPhotoProps): PhotoEntity {
    const photo = new PhotoEntity();
    photo.url = props.url;
    photo.userId = props.userId;
    photo.metadata = props.metadata ?? {};
    photo.validate();
    return photo;
  }

  // Convert to plain object for persistence
  public toObject(): IPhotoProps {
    return {
      id: this.id,
      url: this.url,
      userId: this.userId,
      uploadedAt: this.createdAt,
      metadata: this.metadata,
    };
  }
}
