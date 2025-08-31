import {
  ILoginRequest,
  ILoginResponse,
  IProfile,
  AuthResult,
} from "../domain/interfaces/auth.interface";
import { AuthRepository } from "../infrastructure/repositories/auth.repository";
import { JWTService } from "../domain/services/jwt.service";
import { WalletValidationService } from "../domain/services/wallet-validation.service";

export class LoginUseCase {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Executes the login process for a wallet-based authentication
   * @param loginData - Login request data containing wallet address
   * @returns Promise with login result
   */
  async execute(loginData: ILoginRequest): Promise<AuthResult<ILoginResponse>> {
    try {
      // Validate wallet address format
      const walletValidation = WalletValidationService.validateWalletAddress(
        loginData.walletAddress
      );
      if (!walletValidation.isValid) {
        return {
          success: false,
          message: "Invalid wallet address format",
          code: "INVALID_WALLET_FORMAT",
          details: { errors: walletValidation.errors },
        };
      }

      // Normalize wallet address
      const normalizedWallet = WalletValidationService.normalizeWalletAddress(
        loginData.walletAddress
      );

      // Find profile by wallet address
      const profile =
        await this.authRepository.findProfileByWallet(normalizedWallet);
      if (!profile) {
        return {
          success: false,
          message: "Wallet address not found. Please register first.",
          code: "WALLET_NOT_FOUND",
        };
      }

      // Generate JWT token
      const token = JWTService.generateToken({
        userId: profile.wallet, // Use wallet as userId for JWT
        email: profile.email,
        profileType: profile.profileType,
      });

      // Prepare response
      const response: ILoginResponse = {
        success: true,
        message: "Login successful",
        token,
        user: profile,
      };

      return {
        success: true,
        message: "Login successful",
        data: response,
      };
    } catch (error) {
      console.error("Login use case error:", error);

      return {
        success: false,
        message: "Login failed. Please try again.",
        code: "INTERNAL_ERROR",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Validates a JWT token and returns the associated profile
   * @param token - JWT token to validate
   * @returns Promise with profile validation result
   */
  async validateToken(token: string): Promise<AuthResult<IProfile>> {
    try {
      // Verify and decode token
      const payload = JWTService.verifyToken(token);

      // Find profile by wallet address from token
      const profile = await this.authRepository.findProfileByWallet(
        payload.userId
      );
      if (!profile) {
        return {
          success: false,
          message: "User not found",
          code: "USER_NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Token validated successfully",
        data: profile,
      };
    } catch (error) {
      console.error("Token validation error:", error);

      return {
        success: false,
        message: "Invalid or expired token",
        code: "INVALID_TOKEN",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Refreshes a JWT token
   * @param token - Current JWT token
   * @returns Promise with new token
   */
  async refreshToken(
    token: string
  ): Promise<AuthResult<{ token: string; user: IProfile }>> {
    try {
      // Validate current token
      const validationResult = await this.validateToken(token);
      if (!validationResult.success || !validationResult.data) {
        return {
          success: false,
          message: "Invalid token for refresh",
          code: "INVALID_REFRESH_TOKEN",
        };
      }

      // Generate new token
      const newToken = JWTService.generateToken({
        userId: validationResult.data.wallet, // Use wallet as userId
        email: validationResult.data.email,
        profileType: validationResult.data.profileType,
      });

      return {
        success: true,
        message: "Token refreshed successfully",
        data: {
          token: newToken,
          user: validationResult.data,
        },
      };
    } catch (error) {
      console.error("Token refresh error:", error);

      return {
        success: false,
        message: "Failed to refresh token",
        code: "REFRESH_FAILED",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Logs out a user by invalidating their token (client-side responsibility)
   * @param token - JWT token to logout
   * @returns Promise with logout result
   */
  async logout(token: string): Promise<AuthResult<{ message: string }>> {
    try {
      // Validate token to ensure it was valid
      const validationResult = await this.validateToken(token);
      if (!validationResult.success) {
        return {
          success: false,
          message: "Invalid token for logout",
          code: "INVALID_LOGOUT_TOKEN",
        };
      }

      // Note: In a production environment, you might want to implement
      // a token blacklist or use Redis to track invalidated tokens

      return {
        success: true,
        message: "Logout successful",
        data: { message: "User logged out successfully" },
      };
    } catch (error) {
      console.error("Logout error:", error);

      return {
        success: false,
        message: "Logout failed",
        code: "LOGOUT_FAILED",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.authRepository.disconnect();
  }
}
