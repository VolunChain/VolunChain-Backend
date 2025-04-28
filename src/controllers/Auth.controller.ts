import { Request, Response } from "express";
import AuthService from "../services/AuthService";
import { VerifyEmailDTO } from "../dtos/verifyEmailDTO";
import { ResendVerificationDTO } from "../dtos/resendVerificationDTO";
import { validate } from "class-validator";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, wallet } = req.body;

    try {
      const response = await this.authService.register(name, email, password, wallet);
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      // Create and validate DTO
      const verifyEmailDto = new VerifyEmailDTO();
      verifyEmailDto.token = req.params.token || req.query.token as string;
      
      const errors = await validate(verifyEmailDto);
      if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
      }
      
      const response = await this.authService.verifyEmail(verifyEmailDto.token);
      res.json(response);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Verification failed" });
    }
  };

  resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      // Create and validate DTO
      const resendVerificationDto = new ResendVerificationDTO();
      resendVerificationDto.email = req.body.email;
      
      const errors = await validate(resendVerificationDto);
      if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
      }
      
      const response = await this.authService.resendVerificationEmail(resendVerificationDto.email);
      res.json(response);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Could not resend email" });
    }
  };

  checkVerificationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    try {
      const status = await this.authService.checkVerificationStatus(req.user.id.toString());
      res.json(status);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Could not check verification status" });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { walletAddress } = req.body;

    try {
      const token = await this.authService.authenticate(walletAddress);
      res.json({ token });
    } catch (error) {
      res.status(401).json({ message: error instanceof Error ? error.message : "Unknown error" });
    }
  };

  protectedRoute = (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    res.send(`Hello ${req.user.role}, your ID is ${req.user.id}`);
  };
}

export default new AuthController();
