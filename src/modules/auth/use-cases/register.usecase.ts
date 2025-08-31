import {
  IRegisterRequest,
  IRegisterResponse,
  AuthResult,
} from "../domain/interfaces/auth.interface";
import { AuthRepository } from "../infrastructure/repositories/auth.repository";
import { WalletValidationService } from "../domain/services/wallet-validation.service";

export class RegisterUseCase {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Executes the registration process for a new user or organization
   * @param registerData - Registration request data
   * @returns Promise with registration result
   */
  async execute(
    registerData: IRegisterRequest
  ): Promise<AuthResult<IRegisterResponse>> {
    try {
      // Validate wallet address format
      const walletValidation = WalletValidationService.validateWalletAddress(
        registerData.walletAddress
      );
      if (!walletValidation.isValid) {
        return {
          success: false,
          message: "Invalid wallet address format",
          code: "INVALID_WALLET_FORMAT",
          details: { errors: walletValidation.errors },
        };
      }

      // Validate email format
      const emailValidation = this.validateEmail(registerData.email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          message: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT",
          details: { errors: emailValidation.errors },
        };
      }

      // Validate required fields based on profile type
      const fieldValidation = this.validateRequiredFields(registerData);
      if (!fieldValidation.isValid) {
        return {
          success: false,
          message: "Missing required fields",
          code: "MISSING_REQUIRED_FIELDS",
          details: { errors: fieldValidation.errors },
        };
      }

      // Normalize data
      const normalizedWallet = WalletValidationService.normalizeWalletAddress(
        registerData.walletAddress
      );
      const normalizedEmail = registerData.email.toLowerCase().trim();

      // Check if wallet is already registered
      const isWalletRegistered =
        await this.authRepository.isWalletRegistered(normalizedWallet);
      if (isWalletRegistered) {
        return {
          success: false,
          message: "Wallet address is already registered",
          code: "WALLET_ALREADY_REGISTERED",
        };
      }

      // Check if email is already registered
      const isEmailRegistered =
        await this.authRepository.isEmailRegistered(normalizedEmail);
      if (isEmailRegistered) {
        return {
          success: false,
          message: "Email address is already registered",
          code: "EMAIL_ALREADY_REGISTERED",
        };
      }

      // Create profile based on type
      let response: IRegisterResponse;

      if (registerData.profileType === "user") {
        const user = await this.authRepository.createUser({
          name: registerData.name,
          lastName: registerData.lastName,
          email: normalizedEmail,
          wallet: normalizedWallet,
        });

        response = {
          success: true,
          message: "User registered successfully",
          profile: {
            name: user.name,
            email: user.email,
            wallet: user.wallet,
            profileType: "user",
          },
        };
      } else {
        // Organization registration
        if (!registerData.category) {
          return {
            success: false,
            message: "Category is required for organization registration",
            code: "MISSING_CATEGORY",
          };
        }

        const organization = await this.authRepository.createOrganization({
          name: registerData.name,
          email: normalizedEmail,
          wallet: normalizedWallet,
          category: registerData.category,
        });

        response = {
          success: true,
          message: "Organization registered successfully",
          profile: {
            name: organization.name,
            email: organization.email,
            wallet: organization.wallet,
            profileType: "organization",
            category: organization.category,
          },
        };
      }

      return {
        success: true,
        message: "Registration successful",
        data: response,
      };
    } catch (error) {
      console.error("Registration use case error:", error);

      return {
        success: false,
        message: "Registration failed. Please try again.",
        code: "INTERNAL_ERROR",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Validates email format
   * @param email - Email to validate
   * @returns Validation result
   */
  private validateEmail(email: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!email) {
      errors.push("Email is required");
      return { isValid: false, errors };
    }

    if (typeof email !== "string") {
      errors.push("Email must be a string");
      return { isValid: false, errors };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Invalid email format");
    }

    if (email.length > 254) {
      errors.push("Email is too long (maximum 254 characters)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates required fields based on profile type
   * @param registerData - Registration data to validate
   * @returns Validation result
   */
  private validateRequiredFields(registerData: IRegisterRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate name
    if (!registerData.name || typeof registerData.name !== "string") {
      errors.push("Name is required and must be a string");
    } else if (registerData.name.length < 2) {
      errors.push("Name must be at least 2 characters long");
    } else if (registerData.name.length > 100) {
      errors.push("Name cannot exceed 100 characters");
    }

    // Validate email
    if (!registerData.email || typeof registerData.email !== "string") {
      errors.push("Email is required and must be a string");
    }

    // Validate wallet address
    if (
      !registerData.walletAddress ||
      typeof registerData.walletAddress !== "string"
    ) {
      errors.push("Wallet address is required and must be a string");
    }

    // Validate profile type
    if (
      !registerData.profileType ||
      !["user", "project"].includes(registerData.profileType)
    ) {
      errors.push("Profile type must be either 'user' or 'project'");
    }

    // Validate organization-specific fields
    if (registerData.profileType === "project") {
      if (!registerData.category || typeof registerData.category !== "string") {
        errors.push("Category is required for organization registration");
      } else if (registerData.category.length > 100) {
        errors.push("Category cannot exceed 100 characters");
      }
    }

    // Validate user-specific fields
    if (registerData.profileType === "user" && registerData.lastName) {
      if (typeof registerData.lastName !== "string") {
        errors.push("Last name must be a string");
      } else if (registerData.lastName.length > 100) {
        errors.push("Last name cannot exceed 100 characters");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Checks if a wallet address is available for registration
   * @param walletAddress - Wallet address to check
   * @returns Promise with availability result
   */
  async checkWalletAvailability(
    walletAddress: string
  ): Promise<AuthResult<{ available: boolean }>> {
    try {
      // Validate wallet address format
      const walletValidation =
        WalletValidationService.validateWalletAddress(walletAddress);
      if (!walletValidation.isValid) {
        return {
          success: false,
          message: "Invalid wallet address format",
          code: "INVALID_WALLET_FORMAT",
          details: { errors: walletValidation.errors },
        };
      }

      // Check if wallet is registered
      const normalizedWallet =
        WalletValidationService.normalizeWalletAddress(walletAddress);
      const isRegistered =
        await this.authRepository.isWalletRegistered(normalizedWallet);

      return {
        success: true,
        message: "Wallet availability checked successfully",
        data: { available: !isRegistered },
      };
    } catch (error) {
      console.error("Wallet availability check error:", error);

      return {
        success: false,
        message: "Failed to check wallet availability",
        code: "AVAILABILITY_CHECK_FAILED",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Checks if an email address is available for registration
   * @param email - Email address to check
   * @returns Promise with availability result
   */
  async checkEmailAvailability(
    email: string
  ): Promise<AuthResult<{ available: boolean }>> {
    try {
      // Validate email format
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          message: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT",
          details: { errors: emailValidation.errors },
        };
      }

      // Check if email is registered
      const normalizedEmail = email.toLowerCase().trim();
      const isRegistered =
        await this.authRepository.isEmailRegistered(normalizedEmail);

      return {
        success: true,
        message: "Email availability checked successfully",
        data: { available: !isRegistered },
      };
    } catch (error) {
      console.error("Email availability check error:", error);

      return {
        success: false,
        message: "Failed to check email availability",
        code: "AVAILABILITY_CHECK_FAILED",
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
