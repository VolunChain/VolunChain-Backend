export interface IStorageAdapter {
  upload(file: Buffer, filename: string): Promise<{ url: string; key: string }>;
  delete(key: string): Promise<void>;
}

export interface IPhotoMetadata {
  fileSize?: number;
  mimeType?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  camera?: {
    make?: string;
    model?: string;
    settings?: {
      iso?: number;
      aperture?: string;
      shutterSpeed?: string;
    };
  };
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  tags?: string[];
  description?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface IPhotoProps {
  id?: string;
  url: string;
  userId: string;
  uploadedAt?: Date;
  metadata?: IPhotoMetadata;
}

export interface IPhoto {
  id: string;
  url: string;
  userId: string;
  uploadedAt: Date;
  metadata?: IPhotoMetadata;
  validate(): boolean;
  updateMetadata(newMetadata: Partial<IPhotoMetadata>): void;
  toObject(): IPhotoProps;
}
