import AuthService from "../../../modules/auth/application/services/AuthService";
import { WalletService } from "../services/WalletService";

// Mock the wallet service
jest.mock("../services/WalletService");
jest.mock("../../../config/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock other dependencies
jest.mock("../../../modules/user/repositories/PrismaUserRepository");
jest.mock("../../../modules/auth/use-cases/send-verification-email.usecase");
jest.mock("../../../modules/auth/use-cases/verify-email.usecase");
jest.mock("../../../modules/auth/use-cases/resend-verification-email.usecase");

describe("Wallet Auth Integration", () => {
  let authService: AuthService;
  let mockWalletService: jest.Mocked<WalletService>;

  const validWalletAddress =
    "GCKFBEIYTKP5RDBQMUTAPDCFZDFNVTQNXUCUZMAQYVWLQHTQBDKTQRQY";
  const invalidWalletAddress = "invalid-wallet";

  beforeEach(() => {
    mockWalletService = new WalletService() as jest.Mocked<WalletService>;
    authService = new AuthService();

    // Replace the wallet service instance
    (authService as any).walletService = mockWalletService;

    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should authenticate user with valid wallet", async () => {
      const { prisma } = require("../../../config/prisma");

      mockWalletService.isWalletValid.mockResolvedValue(true);
      prisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        wallet: validWalletAddress,
        email: "test@example.com",
      });

      const token = await authService.authenticate(validWalletAddress);

      expect(mockWalletService.isWalletValid).toHaveBeenCalledWith(
        validWalletAddress
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { wallet: validWalletAddress },
      });
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should reject authentication with invalid wallet", async () => {
      mockWalletService.isWalletValid.mockResolvedValue(false);

      await expect(
        authService.authenticate(invalidWalletAddress)
      ).rejects.toThrow("Invalid wallet address");

      expect(mockWalletService.isWalletValid).toHaveBeenCalledWith(
        invalidWalletAddress
      );
    });

    it("should reject authentication for non-existent user", async () => {
      const { prisma } = require("../../../config/prisma");

      mockWalletService.isWalletValid.mockResolvedValue(true);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.authenticate(validWalletAddress)
      ).rejects.toThrow("User not found");
    });
  });

  describe("register", () => {
    const registrationData = {
      name: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      wallet: validWalletAddress,
    };

    it("should register user with valid wallet", async () => {
      const { prisma } = require("../../../config/prisma");
      const mockUserRepository =
        require("../../../modules/user/repositories/PrismaUserRepository").PrismaUserRepository;
      const mockSendEmailUseCase =
        require("../../../modules/auth/use-cases/send-verification-email.usecase").SendVerificationEmailUseCase;

      mockWalletService.verifyWallet.mockResolvedValue({
        success: true,
        isValid: true,
        accountExists: true,
        walletAddress: validWalletAddress,
        message: "Wallet verified successfully",
        verifiedAt: new Date(),
      });

      const mockUserRepositoryInstance = {
        findByEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: "user-123",
          name: "John",
          email: "john@example.com",
          wallet: validWalletAddress,
        }),
      };

      const mockSendEmailUseCaseInstance = {
        execute: jest.fn().mockResolvedValue({}),
      };

      mockUserRepository.mockImplementation(() => mockUserRepositoryInstance);
      mockSendEmailUseCase.mockImplementation(
        () => mockSendEmailUseCaseInstance
      );

      prisma.user.findUnique.mockResolvedValue(null);

      const result = await authService.register(
        registrationData.name,
        registrationData.lastName,
        registrationData.email,
        registrationData.password,
        registrationData.wallet
      );

      expect(mockWalletService.verifyWallet).toHaveBeenCalledWith(
        validWalletAddress
      );
      expect(result.id).toBe("user-123");
      expect(result.wallet).toBe(validWalletAddress);
      expect(result.walletVerified).toBe(true);
    });

    it("should reject registration with invalid wallet", async () => {
      mockWalletService.verifyWallet.mockResolvedValue({
        success: false,
        isValid: false,
        accountExists: false,
        walletAddress: invalidWalletAddress,
        message: "Invalid wallet format",
        verifiedAt: new Date(),
      });

      await expect(
        authService.register(
          registrationData.name,
          registrationData.lastName,
          registrationData.email,
          registrationData.password,
          invalidWalletAddress
        )
      ).rejects.toThrow("Wallet verification failed: Invalid wallet format");

      expect(mockWalletService.verifyWallet).toHaveBeenCalledWith(
        invalidWalletAddress
      );
    });

    it("should reject registration with already registered wallet", async () => {
      const { prisma } = require("../../../config/prisma");
      const mockUserRepository =
        require("../../../modules/user/repositories/PrismaUserRepository").PrismaUserRepository;

      mockWalletService.verifyWallet.mockResolvedValue({
        success: true,
        isValid: true,
        accountExists: true,
        walletAddress: validWalletAddress,
        message: "Wallet verified successfully",
        verifiedAt: new Date(),
      });

      const mockUserRepositoryInstance = {
        findByEmail: jest.fn().mockResolvedValue(null),
      };

      mockUserRepository.mockImplementation(() => mockUserRepositoryInstance);

      prisma.user.findUnique.mockResolvedValue({
        id: "existing-user",
        wallet: validWalletAddress,
      });

      await expect(
        authService.register(
          registrationData.name,
          registrationData.lastName,
          registrationData.email,
          registrationData.password,
          registrationData.wallet
        )
      ).rejects.toThrow("This wallet address is already registered");
    });
  });
});
