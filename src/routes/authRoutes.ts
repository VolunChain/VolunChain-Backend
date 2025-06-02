import { Router } from "express";
import AuthController from "../controllers/Auth.controller";
import { validateDto } from "../middleware/validation.middleware";
import { RegisterDto, LoginDto, VerifyEmailDto, ResendVerificationDto } from "../dtos/auth.dto";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post('/register', validateDto(RegisterDto), AuthController.register);
router.post('/login', validateDto(LoginDto), AuthController.login);

router.post('/send-verification-email', AuthController.resendVerificationEmail);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.get('/verify-email', AuthController.verifyEmail); // Support query param method
router.post('/resend-verification', validateDto(ResendVerificationDto), AuthController.resendVerificationEmail);

// Protected routes
router.get('/protected', authenticateToken, AuthController.protectedRoute);
router.get('/check-verification', authenticateToken, AuthController.checkVerificationStatus);

// Routes requiring verified email
router.get('/verified-only', 
  authenticateToken, 
  AuthController.requireVerifiedEmail, 
  (req, res) => {
    res.json({ message: "You have access to this protected route because your email is verified!" });
  }
);

export default router;
