import { Router } from "express";
import multer from "multer";
import { PhotoController } from "./controllers/photo-controller";
import { validateDto } from "@/shared/middleware/validation.middleware";
import { DeletePhotoDto, GetPhotoDto, UploadPhotoDto } from "./dto";
import { SupabasePhotoService } from "../infrastructure/adapters/supabase-service.adapter";

const router = Router();
const upload = multer({ dest: "uploads/" });
const service = new SupabasePhotoService();
const photoController = new PhotoController(service);

// Middleware for handling validation errors
router.post(
  "/upload",
  upload.single("photo"),
  validateDto(UploadPhotoDto),
  photoController.uploadPhoto
);

router.delete("/:id", validateDto(DeletePhotoDto), photoController.deletePhoto);

router.get("/:id", validateDto(GetPhotoDto), photoController.getPhotoById);

export default router;
