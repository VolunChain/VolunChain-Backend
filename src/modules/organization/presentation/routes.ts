import { Router } from "express";

//Middlewares
import auth from "../../../middleware/authMiddleware";

//Validate middleware
import {
  validateDto,
  validateParamsDto,
  validateQueryDto,
} from "../../../shared/middleware/validation.middleware";

// Dto base
import {
  UuidParamsDto,
  PaginationQueryDto,
} from "../../../shared/dto/base.dto";

// Dto
import { CreateOrganizationDto, UpdateOrganizationDto } from "./dto";

//Controller
import { OrganizationController } from "./controllers/organization.controller";

// Use Cases
import {
  CreateOrganizationUseCase,
  DeleteOrganizationUseCase,
  GetAllOrganizationsUseCase,
  GetOrganizationByIdUseCase,
  UpdateOrganizationUseCase,
} from "../application/use-cases/index";

// Repository Impl
import { OrganizationRepository } from "../infrastructure";

// Prisma instance
import prisma from "../../../config/prisma";

const router = Router();

const repository = new OrganizationRepository(prisma);
const controller = new OrganizationController(
  new CreateOrganizationUseCase(repository),
  new GetOrganizationByIdUseCase(repository),
  new UpdateOrganizationUseCase(repository),
  new DeleteOrganizationUseCase(repository),
  new GetAllOrganizationsUseCase(repository)
);

// Public routes
router.post(
  "/",
  validateDto(CreateOrganizationDto),
  controller.createOrganization
);

router.get(
  "/",
  validateQueryDto(PaginationQueryDto),
  controller.getAllOrganizations
);

router.get(
  "/:id",
  validateParamsDto(UuidParamsDto),
  controller.getOrganizationById
);

// Protected routes (require authentication)
router.put(
  "/:id",
  auth.authMiddleware,
  validateParamsDto(UuidParamsDto),
  validateDto(UpdateOrganizationDto),
  controller.updateOrganization
);

router.delete(
  "/:id",
  auth.authMiddleware,
  validateParamsDto(UuidParamsDto),
  controller.deleteOrganization
);

export default router;
