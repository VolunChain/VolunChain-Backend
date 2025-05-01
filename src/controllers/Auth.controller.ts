import { Request, Response } from "express";
import AuthService from "../services/AuthService";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    isVerified?: boolean;
  };
}

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const { name, lastName, email, password, wallet } = req.body;

    try {
      const response = await this.authService.register(name, lastName, email, password, wallet);
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const token = typeof req.params.token === 'string'
    ? req.params.token
    : typeof req.query.token === 'string'
    ? req.query.token
    : undefined;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ message: "Token is required" });
      return;
    }

    try {
      const response = await this.authService.verifyEmail(token);
      res.json(response);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Verification failed" });
    }
  };

  resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    try {
      const response = await this.authService.resendVerificationEmail(email);
      res.json(response);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Could not resend email" });
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

  protectedRoute = (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    res.json({ 
      message: `Hello ${req.user.role}`, 
      userId: req.user.id,
      isVerified: req.user.isVerified
    });
  };
}

export default new AuthController();