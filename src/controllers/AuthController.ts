import { Request, Response } from 'express';
import AuthService from '../services/AuthService';

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

  login = async (req: Request, res: Response): Promise<void> => {
    const { walletAddress } = req.body;

    try {
      const token = await this.authService.authenticate(walletAddress);
      res.json({ token });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(401).json({ message: "Unknown error" });
      }
    }
  };

  protectedRoute = (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    res.send(`Hello ${req.user.role}, your ID is ${req.user.id}`);
  };
}

export default new AuthController();