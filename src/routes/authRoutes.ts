import { Router } from "express";
import AuthController from "../controllers/Auth.controller";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/login", AuthController.login);
router.get("/protected", authMiddleware, AuthController.protectedRoute);

router.post("/send-verification-email", AuthController.resendVerificationEmail);
router.get("/verify-email", AuthController.verifyEmail);
router.post(
  "/resend-verification-email",
  AuthController.resendVerificationEmail
);

export default router;
