import { Router } from "express";
import OrganizationController from "../controllers/OrganizationController";
import { validateDto } from "../middleware/validation.middleware";
import { CreateOrganizationDto, UpdateOrganizationDto, GetOrganizationByEmailDto } from "../dtos/organization.dto";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Protected routes
router.post("/", authenticateToken, validateDto(CreateOrganizationDto), OrganizationController.createOrganization);
router.get("/", authenticateToken, OrganizationController.getAllOrganizations);
router.get("/:id", authenticateToken, OrganizationController.getOrganizationById);
router.get("/email/:email", authenticateToken, OrganizationController.getOrganizationByEmail);
router.patch("/:id", authenticateToken, validateDto(UpdateOrganizationDto), OrganizationController.updateOrganization);
router.delete("/:id", authenticateToken, OrganizationController.deleteOrganization);

export default router;
