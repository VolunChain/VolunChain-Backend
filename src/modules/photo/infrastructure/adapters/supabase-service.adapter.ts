import { prisma } from "@/config/prisma";
import { IPhotoMetadata } from "../../domain/entities/interfaces/photo.interface";
import { IPhotoServiceAdapter } from "./interface/photo-service.adapter";
import { supabase } from "@/config/supabase";
import { PhotoEntity } from "../../domain/entities/photo.entity";

export class SupabasePhotoService implements IPhotoServiceAdapter {
  //Metadata options are enabled if needed later
  async upload(
    file: Express.Multer.File,
    userId: string,
    metadata?: IPhotoMetadata
  ): Promise<PhotoEntity> {
    const fileName = `${Date.now()}-${file.originalname}`;

    // Subir archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data: publicUrl } = supabase.storage
      .from("photos")
      .getPublicUrl(fileName);

    if (!publicUrl) throw new Error("Could not get public URL");

    // Guardar en DB con Prisma
    const photo = await prisma.photo.create({
      data: {
        userId,
        url: publicUrl.publicUrl,
        metadata: {
          ...metadata,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
        uploadedAt: new Date(),
      },
    });

    return PhotoEntity.create({
      id: photo.url,
      url: photo.url,
      userId,
      metadata,
      uploadedAt: photo.uploadedAt ?? new Date(),
    });
  }

  async delete(photoId: string): Promise<void> {
    // Find in DB
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new Error("Photo not found");
    }

    // Extract fileName from public URL (what follows after /photos/)
    const urlParts = photo.url.split("/");
    const fileName = urlParts[urlParts.length - 1];

    // Delete from Supabase Storage using supabaseStorage
    const { error: deleteError } = await supabase.storage
      .from("photos")
      .remove([fileName]);

    if (deleteError) throw deleteError;

    // Delete from DB
    await prisma.photo.delete({ where: { id: photoId } });
  }

  async getById(photoId: string): Promise<{ id: string; url: string } | null> {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) return null;

    return { id: photo.id, url: photo.url };
  }

  async updateMetadata(
    photoId: string,
    metadata: IPhotoMetadata
  ): Promise<IPhotoMetadata> {
    const updatedPhoto = await prisma.photo.update({
      where: { id: photoId },
      data: { metadata },
      select: { metadata: true },
    });

    // Assuming metadata is not null after update
    return updatedPhoto.metadata as IPhotoMetadata;
  }
}
