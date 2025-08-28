import { Router } from "express";
import {
  validateDto,
  validateParamsDto,
  validateQueryDto,
} from "../../shared/middleware/validation.middleware";
import { CreateOrganizationDto } from "../../modules/organization/presentation/dto/create-organization.dto";
import { UpdateOrganizationDto } from "../../modules/organization/presentation/dto/update-organization.dto";
import { UuidParamsDto, PaginationQueryDto } from "../../shared/dto/base.dto";
import auth from "../../middleware/authMiddleware";

const router = Router();

// Note: This is an example of how to properly integrate validation middleware
// The controller would need to be properly instantiated with dependencies

// POST /organizations - Create organization
router.post(
  "/",
  validateDto(CreateOrganizationDto)
  // organizationController.createOrganization
);

// GET /organizations - Get all organizations with pagination
router.get(
  "/",
  validateQueryDto(PaginationQueryDto)
  // organizationController.getAllOrganizations
);

// GET /organizations/:id - Get organization by ID
router.get(
  "/:id",
  validateParamsDto(UuidParamsDto)
  // organizationController.getOrganizationById
);

// PUT /organizations/:id - Update organization (protected)
router.put(
  "/:id",
  auth.authMiddleware,
  validateParamsDto(UuidParamsDto),
  validateDto(UpdateOrganizationDto)
  // organizationController.updateOrganization
);

// DELETE /organizations/:id - Delete organization (protected)
router.delete(
  "/:id",
  auth.authMiddleware,
  validateParamsDto(UuidParamsDto)
  // organizationController.deleteOrganization
);

export default router;
