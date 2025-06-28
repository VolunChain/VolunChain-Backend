import AuthService from "../../src/modules/auth/application/services/AuthService";
import { WalletService } from "../../src/modules/wallet/services/WalletService";

// Mock the wallet service
jest.mock("../../src/modules/wallet/services/WalletService");
jest.mock("../../src/config/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock other dependencies
jest.mock("../../src/modules/user/repositories/PrismaUserRepository");
jest.mock("../../src/modules/auth/use-cases/send-verification-email.usecase");
jest.mock("../../src/modules/auth/use-cases/verify-email.usecase");
jest.mock("../../src/modules/auth/use-cases/resend-verification-email.usecase");

describe("Wallet Auth Integration", () => {
  let authService: AuthService;
  let mockWalletService: jest.Mocked<WalletService>;

  const validWalletAddress =
    "GCDCSYJ2SPFW4NEJP2RDSINPTMJMUIFNQ5D2DZ52IGI4W2PAJTB5VQ42";
  const invalidWalletAddress = "invalid-wallet";

  beforeEach(() => {
    // Create mock instances
    const mockUserRepositoryInstance = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      isUserVerified: jest.fn(),
      setVerificationToken: jest.fn(),
      findByVerificationToken: jest.fn(),
      verifyUser: jest.fn(),
    };

    const mockSendEmailUseCaseInstance = {
      execute: jest.fn(),
    };

    const mockVerifyEmailUseCaseInstance = {
      execute: jest.fn(),
    };

    const mockResendEmailUseCaseInstance = {
      execute: jest.fn(),
    };

    // Mock the constructors to return our mock instances
    const mockUserRepository =
      require("../../src/modules/user/repositories/PrismaUserRepository").PrismaUserRepository;
    const mockSendEmailUseCase =
      require("../../src/modules/auth/use-cases/send-verification-email.usecase").SendVerificationEmailUseCase;
    const mockVerifyEmailUseCase =
      require("../../src/modules/auth/use-cases/verify-email.usecase").VerifyEmailUseCase;
    const mockResendEmailUseCase =
      require("../../src/modules/auth/use-cases/resend-verification-email.usecase").ResendVerificationEmailUseCase;

    mockUserRepository.mockImplementation(() => mockUserRepositoryInstance);
    mockSendEmailUseCase.mockImplementation(() => mockSendEmailUseCaseInstance);
    mockVerifyEmailUseCase.mockImplementation(
      () => mockVerifyEmailUseCaseInstance
    );
    mockResendEmailUseCase.mockImplementation(
      () => mockResendEmailUseCaseInstance
    );

    mockWalletService = new WalletService() as jest.Mocked<WalletService>;
    authService = new AuthService();

    // Replace the wallet service instance
    (authService as any).walletService = mockWalletService;

    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("should authenticate user with valid wallet", async () => {
      const { prisma } = require("../../src/config/prisma");

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
      const { prisma } = require("../../src/config/prisma");

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
      const { prisma } = require("../../src/config/prisma");

      // Set up wallet service mock
      mockWalletService.verifyWallet.mockResolvedValue({
        success: true,
        isValid: true,
        accountExists: true,
        walletAddress: validWalletAddress,
        message: "Wallet verified successfully",
        verifiedAt: new Date(),
      });

      // Set up user repository mock
      const mockUserRepositoryInstance = (authService as any).userRepository;
      mockUserRepositoryInstance.findByEmail.mockResolvedValue(null);
      mockUserRepositoryInstance.create.mockResolvedValue({
        id: "user-123",
        name: "John",
        lastName: "Doe",
        email: "john@example.com",
        wallet: validWalletAddress,
        isVerified: false,
      });

      // Set up send email use case mock
      const mockSendEmailUseCaseInstance = (authService as any)
        .sendVerificationEmailUseCase;
      mockSendEmailUseCaseInstance.execute.mockResolvedValue({});

      // Set up prisma mock
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
      const { prisma } = require("../../src/config/prisma");
      const mockUserRepository =
        require("../../src/modules/user/repositories/PrismaUserRepository").PrismaUserRepository;

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
