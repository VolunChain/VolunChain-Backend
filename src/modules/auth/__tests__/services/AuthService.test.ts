import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import AuthService from "../../application/services/AuthService";
import { PrismaUserRepository } from "../../../user/repositories/PrismaUserRepository";
import { SendVerificationEmailUseCase } from "../../use-cases/send-verification-email.usecase";
import { VerifyEmailUseCase } from "../../use-cases/verify-email.usecase";
import { ResendVerificationEmailUseCase } from "../../use-cases/resend-verification-email.usecase";
import { WalletService } from "../../../wallet/services/WalletService";

// Mock dependencies
jest.mock("../../../user/repositories/PrismaUserRepository");
jest.mock("../../use-cases/send-verification-email.usecase");
jest.mock("../../use-cases/verify-email.usecase");
jest.mock("../../use-cases/resend-verification-email.usecase");
jest.mock("../../../wallet/services/WalletService");
jest.mock("../../../../config/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Declare mockPrisma at the top level
let mockPrisma: any;

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<PrismaUserRepository>;
  let mockSendVerificationEmailUseCase: jest.Mocked<SendVerificationEmailUseCase>;
  let mockVerifyEmailUseCase: jest.Mocked<VerifyEmailUseCase>;
  let mockResendVerificationEmailUseCase: jest.Mocked<ResendVerificationEmailUseCase>;
  let mockWalletService: jest.Mocked<WalletService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up prisma mock at the top level
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
      },
    };
    jest.doMock("../../../../config/prisma", () => ({
      prisma: mockPrisma,
    }));

    // Mock all required methods for PrismaUserRepository
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      isUserVerified: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<PrismaUserRepository>;

    mockSendVerificationEmailUseCase = {
      execute: jest.fn(),
      userRepository: {} as any,
    } as unknown as jest.Mocked<SendVerificationEmailUseCase>;

    mockVerifyEmailUseCase = {
      execute: jest.fn(),
      userRepository: {} as any,
    } as unknown as jest.Mocked<VerifyEmailUseCase>;

    mockResendVerificationEmailUseCase = {
      execute: jest.fn(),
      userRepository: {} as any,
    } as unknown as jest.Mocked<ResendVerificationEmailUseCase>;

    mockWalletService = {
      isWalletValid: jest.fn(),
      verifyWallet: jest.fn(),
      validateWalletFormat: jest.fn(),
      walletRepository: {} as any,
      verifyWalletUseCase: {} as any,
      validateWalletFormatUseCase: {} as any,
    } as unknown as jest.Mocked<WalletService>;

    // Use the correct constructor for AuthService (update this if the signature is different)
    // If AuthService expects no arguments, just use: authService = new AuthService();
    // Otherwise, pass the correct mocks as per the actual constructor
    authService = new AuthService();
  });

  describe("authenticate", () => {
    it("should authenticate user with valid wallet address", async () => {
      const walletAddress = "test-wallet-address";
      const mockUser = { id: "user-id", wallet: walletAddress };

      mockWalletService.isWalletValid.mockResolvedValue(true);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.authenticate(walletAddress);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0); // Ensure token is not empty
      expect(mockWalletService.isWalletValid).toHaveBeenCalledWith(
        walletAddress
      );
      expect(mockWalletService.isWalletValid).toHaveBeenCalledTimes(1);
      expect(prisma!.user.findUnique).toHaveBeenCalledWith({
        where: { wallet: walletAddress },
      });
      expect(prisma!.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should throw error for invalid wallet address", async () => {
      const walletAddress = "invalid-wallet-address";

      mockWalletService.isWalletValid.mockResolvedValue(false);

      await expect(authService.authenticate(walletAddress)).rejects.toThrow(
        "Invalid wallet address"
      );
      expect(mockWalletService.isWalletValid).toHaveBeenCalledWith(
        walletAddress
      );
    });

    it("should throw error when user not found", async () => {
      const walletAddress = "test-wallet-address";

      mockWalletService.isWalletValid.mockResolvedValue(true);
      const { prisma } = require("../../../../config/prisma");
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.authenticate(walletAddress)).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("register", () => {
    it("should register new user successfully", async () => {
      const userData = {
        name: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
        wallet: "test-wallet-address",
      };

      const mockWalletVerification = {
        success: true,
        isValid: true,
        accountExists: true,
        walletAddress: userData.wallet,
        verifiedAt: new Date(),
        message: "Wallet verified",
      };

      const mockUser = {
        id: "user-id",
        name: userData.name,
        email: userData.email,
        wallet: userData.wallet,
      };

      mockWalletService.verifyWallet.mockResolvedValue(mockWalletVerification);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      const { prisma } = require("../../../../config/prisma");
      prisma.user.findUnique.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockSendVerificationEmailUseCase.execute.mockResolvedValue({
        success: true,
        message: "Verification email sent",
      });

      const result = await authService.register(
        userData.name,
        userData.lastName,
        userData.email,
        userData.password,
        userData.wallet
      );

      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        wallet: mockUser.wallet,
        walletVerified: mockWalletVerification.accountExists,
        message:
          "User registered successfully. Please check your email to verify your account.",
      });
    });

    it("should throw error when wallet verification fails", async () => {
      const userData = {
        name: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
        wallet: "invalid-wallet",
      };

      const mockWalletVerification = {
        success: false,
        isValid: false,
        walletAddress: userData.wallet,
        accountExists: false,
        verifiedAt: null as any,
        message: "Invalid wallet address",
      };

      mockWalletService.verifyWallet.mockResolvedValue(mockWalletVerification);

      await expect(
        authService.register(
          userData.name,
          userData.lastName,
          userData.email,
          userData.password,
          userData.wallet
        )
      ).rejects.toThrow("Wallet verification failed: Invalid wallet address");
    });

    it("should throw error when user with email already exists", async () => {
      const userData = {
        name: "Test",
        lastName: "User",
        email: "existing@example.com",
        password: "password123",
        wallet: "test-wallet-address",
      };

      const mockWalletVerification = {
        success: true,
        isValid: true,
        accountExists: true,
        walletAddress: userData.wallet,
        verifiedAt: new Date(),
        message: "Wallet verified",
      };

      mockWalletService.verifyWallet.mockResolvedValue(mockWalletVerification);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: "existing-user",
      } as any);

      await expect(
        authService.register(
          userData.name,
          userData.lastName,
          userData.email,
          userData.password,
          userData.wallet
        )
      ).rejects.toThrow("User with this email already exists");
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      const token = "verification-token";
      const expectedResult = {
        success: true,
        message: "Email verified",
        verified: true,
      };

      mockVerifyEmailUseCase.execute.mockResolvedValue(expectedResult);

      const result = await authService.verifyEmail(token);

      expect(result).toEqual(expectedResult);
      expect(mockVerifyEmailUseCase.execute).toHaveBeenCalledWith({ token });
    });
  });

  describe("resendVerificationEmail", () => {
    it("should resend verification email successfully", async () => {
      const email = "test@example.com";
      const expectedResult = {
        success: true,
        message: "Verification email sent",
      };

      mockResendVerificationEmailUseCase.execute.mockResolvedValue(
        expectedResult
      );

      const result = await authService.resendVerificationEmail(email);

      expect(result).toEqual(expectedResult);
      expect(mockResendVerificationEmailUseCase.execute).toHaveBeenCalledWith({
        email,
      });
    });
  });

  describe("checkVerificationStatus", () => {
    it("should return verification status for verified user", async () => {
      const userId = "user-id";
      mockUserRepository.isUserVerified.mockResolvedValue(true);

      const result = await authService.checkVerificationStatus(userId);

      expect(result).toEqual({
        isVerified: true,
        message: "Email is verified",
      });
      expect(mockUserRepository.isUserVerified).toHaveBeenCalledWith(userId);
    });

    it("should return verification status for unverified user", async () => {
      const userId = "user-id";
      mockUserRepository.isUserVerified.mockResolvedValue(false);

      const result = await authService.checkVerificationStatus(userId);

      expect(result).toEqual({
        isVerified: false,
        message: "Email is not verified",
      });
    });
  });

  describe("verifyWalletAddress", () => {
    it("should verify wallet address", async () => {
      const walletAddress = "test-wallet-address";
      const expectedResult = {
        success: true,
        isValid: true,
        walletAddress,
        accountExists: true,
        verifiedAt: new Date(),
        message: "Wallet verified",
      };

      mockWalletService.verifyWallet.mockResolvedValue(expectedResult);

      const result = await authService.verifyWalletAddress(walletAddress);

      expect(result).toEqual(expectedResult);
      expect(mockWalletService.verifyWallet).toHaveBeenCalledWith(
        walletAddress
      );
    });
  });

  describe("validateWalletFormat", () => {
    it("should validate wallet format", async () => {
      const walletAddress = "test-wallet-address";
      const expectedResult = {
        success: true,
        isValid: true,
        walletAddress,
        accountExists: true,
        verifiedAt: new Date(),
        message: "Format valid",
      };

      mockWalletService.validateWalletFormat.mockResolvedValue(expectedResult);

      const result = await authService.validateWalletFormat(walletAddress);

      expect(result).toEqual(expectedResult);
      expect(mockWalletService.validateWalletFormat).toHaveBeenCalledWith(
        walletAddress
      );
    });
  });
});
