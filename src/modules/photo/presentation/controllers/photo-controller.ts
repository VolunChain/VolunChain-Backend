import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { SupabasePhotoService } from "../../infrastructure/adapters/supabase-service.adapter";

// Extend the Request interface to include the 'file' property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export class PhotoController {
  constructor(private readonly supabasePhotoService: SupabasePhotoService) {}

  uploadPhoto = asyncHandler(
    async (req: MulterRequest, res: Response): Promise<void> => {
      if (!req.file) {
        res.status(400).json({ error: "Photo is required" });
        return;
      }

      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const photo = await this.supabasePhotoService.upload(req.file, userId);
      res.status(201).json(photo);
    }
  );

  deletePhoto = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      // Verificar si la foto existe usando el servicio
      const photo = await this.supabasePhotoService.getById(id);

      if (!photo) {
        res.status(404).json({ error: "Photo not found" });
        return;
      }

      // Eliminar la foto usando el servicio
      await this.supabasePhotoService.delete(id);
      res.status(204).send(); // No content
    }
  );

  getPhotoById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      const photo = await this.supabasePhotoService.getById(id);

      if (!photo) {
        res.status(404).json({ error: "Photo not found" });
        return;
      }

      res.json(photo);
    }
  );

  updatePhoto = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar si la foto existe
      const existingPhoto = await this.supabasePhotoService.getById(id);

      if (!existingPhoto) {
        res.status(404).json({ error: "Photo not found" });
        return;
      }

      const updatedPhoto = await this.supabasePhotoService.upload(
        updateData,
        id
      );
      res.json(updatedPhoto);
    }
  );

  updatePhotoMetadata = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const { metadata } = req.body;

      // Verificar si la foto existe
      const existingPhoto = await this.supabasePhotoService.getById(id);

      if (!existingPhoto) {
        res.status(404).json({ error: "Photo not found" });
        return;
      }

      const updatedPhoto = await this.supabasePhotoService.updateMetadata(
        id,
        metadata
      );
      res.json(updatedPhoto);
    }
  );
}
