import { Router } from "express";
import AuthController from "../modules/auth/presentation/controllers/Auth.controller";
import authMiddleware from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types/auth.types";

const router = Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get(
  "/validate-wallet/:walletAddress",
  AuthController.validateWalletFormat
);
router.get(
  "/check-wallet/:walletAddress",
  AuthController.checkWalletAvailability
);
router.get("/check-email/:email", AuthController.checkEmailAvailability);

// Protected routes
router.get(
  "/profile",
  authMiddleware.authMiddleware,
  AuthController.getProfile
);
router.post(
  "/validate-token",
  authMiddleware.authMiddleware,
  AuthController.validateToken
);
router.post(
  "/refresh-token",
  authMiddleware.authMiddleware,
  AuthController.refreshToken
);
router.post("/logout", authMiddleware.authMiddleware, AuthController.logout);

// Routes requiring specific profile types
router.get(
  "/user-only",
  authMiddleware.authMiddleware,
  authMiddleware.requireUserProfile,
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: "User-only route accessed successfully",
    });
  }
);

router.get(
  "/organization-only",
  authMiddleware.authMiddleware,
  authMiddleware.requireOrganizationProfile,
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: "Organization-only route accessed successfully",
    });
  }
);

export default router;
