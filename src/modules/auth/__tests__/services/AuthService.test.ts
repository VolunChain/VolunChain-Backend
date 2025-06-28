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

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<PrismaUserRepository>;
  let mockSendVerificationEmailUseCase: jest.Mocked<SendVerificationEmailUseCase>;
  let mockVerifyEmailUseCase: jest.Mocked<VerifyEmailUseCase>;
  let mockResendVerificationEmailUseCase: jest.Mocked<ResendVerificationEmailUseCase>;
  let mockWalletService: jest.Mocked<WalletService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository =
      new PrismaUserRepository() as jest.Mocked<PrismaUserRepository>;
    mockSendVerificationEmailUseCase = new SendVerificationEmailUseCase(
      mockUserRepository
    ) as jest.Mocked<SendVerificationEmailUseCase>;
    mockVerifyEmailUseCase = new VerifyEmailUseCase(
      mockUserRepository
    ) as jest.Mocked<VerifyEmailUseCase>;
    mockResendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
      mockUserRepository
    ) as jest.Mocked<ResendVerificationEmailUseCase>;
    mockWalletService = new WalletService() as jest.Mocked<WalletService>;

    authService = new AuthService();
  });

  describe("authenticate", () => {
    it("should authenticate user with valid wallet address", async () => {
      const walletAddress = "test-wallet-address";
      const mockUser = { id: "user-id", wallet: walletAddress };

      mockWalletService.isWalletValid.mockResolvedValue(true);
      const { prisma } = require("../../../../config/prisma");
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.authenticate(walletAddress);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(mockWalletService.isWalletValid).toHaveBeenCalledWith(
        walletAddress
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { wallet: walletAddress },
      });
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
      mockSendVerificationEmailUseCase.execute.mockResolvedValue(undefined);

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
      const expectedResult = { success: true, message: "Email verified" };

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
      const expectedResult = { success: true, isValid: true };

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
      const expectedResult = { isValid: true };

      mockWalletService.validateWalletFormat.mockResolvedValue(expectedResult);

      const result = await authService.validateWalletFormat(walletAddress);

      expect(result).toEqual(expectedResult);
      expect(mockWalletService.validateWalletFormat).toHaveBeenCalledWith(
        walletAddress
      );
    });
  });
});
