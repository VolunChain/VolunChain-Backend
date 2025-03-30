import { Request, Response } from "express";
import AuthService from "../services/AuthService";

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
      const response = await this.authService.register(
        name,
        email,
        password,
        wallet
      );
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Registration failed",
      });
    }
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;

    try {
      const response = await this.authService.verifyEmail(token);
      res.json(response);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Verification failed",
      });
    }
  };

  resendVerificationEmail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { email } = req.body;

    try {
      const response = await this.authService.resendVerificationEmail(email);
      res.json(response);
    } catch (error) {
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Could not resend email",
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { walletAddress } = req.body;

    try {
      const token = await this.authService.authenticate(walletAddress);
      res.json({ token });
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
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
