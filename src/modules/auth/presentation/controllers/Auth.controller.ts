import { Request, Response } from "express";
import { validateOr400 } from "../../../../shared/middleware/validation.middleware";
import { LoginDto } from "../../dto/login.dto";
import { RegisterDto } from "../../dto/register.dto";
import { LoginUseCase } from "../../use-cases/login.usecase";
import { RegisterUseCase } from "../../use-cases/register.usecase";
import { JWTService } from "../../domain/services/jwt.service";
import { WalletValidationService } from "../../domain/services/wallet-validation.service";
import { IAuthError, IProfile } from "../../domain/interfaces/auth.interface";

export class AuthController {
  private loginUseCase: LoginUseCase;
  private registerUseCase: RegisterUseCase;

  constructor() {
    this.loginUseCase = new LoginUseCase();
    this.registerUseCase = new RegisterUseCase();
  }

  /**
   * Register a new user or organization
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = await validateOr400(RegisterDto, req.body, res);
      if (!dto) return;

      const result = await this.registerUseCase.execute({
        name: dto.name,
        email: dto.email,
        walletAddress: dto.walletAddress,
        profileType: dto.profileType,
        lastName: dto.lastName,
        category: dto.category,
      });

      if (result.success && result.data) {
        res.status(201).json(result.data);
      } else {
        const errorResult = result as IAuthError;
        const statusCode = this.getStatusCodeForError(errorResult.code);
        res.status(statusCode).json({
          success: false,
          message: errorResult.message,
          code: errorResult.code,
          details: errorResult.details,
        });
      }
    } catch (error) {
      console.error("Registration controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during registration",
        code: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Login with wallet address
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = await validateOr400(LoginDto, req.body, res);
      if (!dto) return;

      const result = await this.loginUseCase.execute({
        walletAddress: dto.walletAddress,
      });

      if (result.success && result.data) {
        res.status(200).json(result.data);
      } else {
        const errorResult = result as IAuthError;
        const statusCode = this.getStatusCodeForError(errorResult.code);
        res.status(statusCode).json({
          success: false,
          message: errorResult.message,
          code: errorResult.code,
          details: errorResult.details,
        });
      }
    } catch (error) {
      console.error("Login controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during login",
        code: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Validate JWT token
   */
  validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = JWTService.extractTokenFromHeader(
        req.headers.authorization
      );
      if (!token) {
        res.status(401).json({
          success: false,
          message: "No token provided",
          code: "NO_TOKEN",
        });
        return;
      }

      const result = await this.loginUseCase.validateToken(token);
      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          message: "Token is valid",
          user: result.data,
        });
      } else {
        const errorResult = result as IAuthError;
        res.status(401).json({
          success: false,
          message: errorResult.message,
          code: errorResult.code,
          details: errorResult.details,
        });
      }
    } catch (error) {
      console.error("Token validation controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during token validation",
        code: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Refresh JWT token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = JWTService.extractTokenFromHeader(
        req.headers.authorization
      );
      if (!token) {
        res.status(401).json({
          success: false,
          message: "No token provided",
          code: "NO_TOKEN",
        });
        return;
      }

      const result = await this.loginUseCase.refreshToken(token);
      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          message: "Token refreshed successfully",
          token: result.data.token,
          user: result.data.user,
        });
      } else {
        const errorResult = result as IAuthError;
        res.status(401).json({
          success: false,
          message: errorResult.message,
          code: errorResult.code,
          details: errorResult.details,
        });
      }
    } catch (error) {
      console.error("Token refresh controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during token refresh",
        code: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Logout user
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = JWTService.extractTokenFromHeader(
        req.headers.authorization
      );
      if (!token) {
        res.status(401).json({
          success: false,
          message: "No token provided",
          code: "NO_TOKEN",
        });
        return;
      }

      const result = await this.loginUseCase.logout(token);
      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Logout successful",
        });
      } else {
        const errorResult = result as IAuthError;
        res.status(400).json({
          success: false,
          message: errorResult.message,
          code: errorResult.code,
          details: errorResult.details,
        });
      }
    } catch (error) {
      console.error("Logout controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during logout",
        code: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Validate wallet address format
   */
  validateWalletFormat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { walletAddress } = req.params;
      if (!walletAddress) {
        res.status(400).json({
          success: false,
          message: "Wallet address is required",
          code: "MISSING_WALLET_ADDRESS",
        });
        return;
      }

      const validation =
        WalletValidationService.validateWalletAddress(walletAddress);
      res.status(200).json({
        success: true,
        isValid: validation.isValid,
        errors: validation.errors,
      });
    } catch (error) {
      console.error("Wallet validation controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during wallet validation",
        code: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Check wallet availability
   */
  checkWalletAvailability = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { walletAddress } = req.params;
      if (!walletAddress) {
        res.status(400).json({
          success: false,
          message: "Wallet address is required",
          code: "MISSING_WALLET_ADDRESS",
        });
        return;
      }

      const result =
        await this.registerUseCase.checkWalletAvailability(walletAddress);
      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          available: result.data.available,
          message: result.data.available
            ? "Wallet address is available"
            : "Wallet address is already registered",
        });
      } else {
        const errorResult = result as IAuthError;
        res.status(400).json({
          success: false,
          message: errorResult.message,
          code: errorResult.code,
          details: errorResult.details,
        });
      }
    } catch (error) {
      console.error("Wallet availability check controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during wallet availability check",
        code: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Check email availability
   */
  checkEmailAvailability = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.params;
      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
          code: "MISSING_EMAIL",
        });
        return;
      }

      const result = await this.registerUseCase.checkEmailAvailability(email);
      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          available: result.data.available,
          message: result.data.available
            ? "Email is available"
            : "Email is already registered",
        });
      } else {
        const errorResult = result as IAuthError;
        res.status(400).json({
          success: false,
          message: errorResult.message,
          code: errorResult.code,
          details: errorResult.details,
        });
      }
    } catch (error) {
      console.error("Email availability check controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during email availability check",
        code: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Get user profile (protected route)
   */
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // The user data is already attached by the auth middleware
      const user = (req as { user?: IProfile }).user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          code: "NOT_AUTHENTICATED",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        user,
      });
    } catch (error) {
      console.error("Get profile controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while retrieving profile",
        code: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Helper method to determine HTTP status code based on error code
   */
  private getStatusCodeForError(code?: string): number {
    switch (code) {
      case "INVALID_WALLET_FORMAT":
      case "INVALID_EMAIL_FORMAT":
      case "MISSING_REQUIRED_FIELDS":
      case "MISSING_CATEGORY":
        return 400;
      case "WALLET_ALREADY_REGISTERED":
      case "EMAIL_ALREADY_REGISTERED":
        return 409;
      case "WALLET_NOT_FOUND":
      case "USER_NOT_FOUND":
      case "INVALID_TOKEN":
      case "INVALID_REFRESH_TOKEN":
      case "INVALID_LOGOUT_TOKEN":
        return 401;
      case "NO_TOKEN":
        return 401;
      default:
        return 500;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await Promise.all([
      this.loginUseCase.cleanup(),
      this.registerUseCase.cleanup(),
    ]);
  }
}

export default new AuthController();
