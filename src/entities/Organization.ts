import { Router } from "express";
import OrganizationController from "./controllers/OrganizationController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/organizations", OrganizationController.createOrganization);
router.get("/organizations", OrganizationController.getAllOrganizations);
router.get("/organizations/:id", OrganizationController.getOrganizationById);
router.get(
  "/organizations/email/:email",
  OrganizationController.getOrganizationByEmail
);

// Protected routes
router.put(
  "/organizations/:id",
  authMiddleware,
  OrganizationController.updateOrganization
);
router.delete(
  "/organizations/:id",
  authMiddleware,
  OrganizationController.deleteOrganization
);

export default router;
