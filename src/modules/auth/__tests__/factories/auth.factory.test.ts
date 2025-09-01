import { AuthModuleFactory } from "../../factories/auth.factory";
import { PrismaUserRepository } from "../../../user/repositories/PrismaUserRepository";
import { SendVerificationEmailUseCase } from "../../use-cases/send-verification-email.usecase";
import { ResendVerificationEmailUseCase } from "../../use-cases/resend-verification-email.usecase";
import { VerifyEmailUseCase } from "../../use-cases/verify-email.usecase";
import { ValidateWalletFormatUseCase } from "../../use-cases/wallet-format-validation.usecase";
import { VerifyWalletUseCase } from "../../use-cases/verify-wallet.usecase";

// Mock the dependencies
jest.mock("../../../user/repositories/PrismaUserRepository");
jest.mock("../../use-cases/send-verification-email.usecase");
jest.mock("../../use-cases/resend-verification-email.usecase");
jest.mock("../../use-cases/verify-email.usecase");
jest.mock("../../use-cases/wallet-format-validation.usecase");
jest.mock("../../use-cases/verify-wallet.usecase");

describe("AuthModuleFactory", () => {
  let mockUserRepository: jest.Mocked<PrismaUserRepository>;
  let mockSendVerificationEmailUseCase: jest.Mocked<SendVerificationEmailUseCase>;
  let mockResendVerificationEmailUseCase: jest.Mocked<ResendVerificationEmailUseCase>;
  let mockVerifyEmailUseCase: jest.Mocked<VerifyEmailUseCase>;
  let mockValidateWalletFormatUseCase: jest.Mocked<ValidateWalletFormatUseCase>;
  let mockVerifyWalletUseCase: jest.Mocked<VerifyWalletUseCase>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock instances
    mockUserRepository = new PrismaUserRepository() as jest.Mocked<PrismaUserRepository>;
    mockSendVerificationEmailUseCase = new SendVerificationEmailUseCase(mockUserRepository) as jest.Mocked<SendVerificationEmailUseCase>;
    mockResendVerificationEmailUseCase = new ResendVerificationEmailUseCase(mockUserRepository) as jest.Mocked<ResendVerificationEmailUseCase>;
    mockVerifyEmailUseCase = new VerifyEmailUseCase(mockUserRepository) as jest.Mocked<VerifyEmailUseCase>;
    mockValidateWalletFormatUseCase = new ValidateWalletFormatUseCase() as jest.Mocked<ValidateWalletFormatUseCase>;
    mockVerifyWalletUseCase = new VerifyWalletUseCase() as jest.Mocked<VerifyWalletUseCase>;

    // Mock the constructors
    (PrismaUserRepository as jest.Mock).mockImplementation(() => mockUserRepository);
    (SendVerificationEmailUseCase as jest.Mock).mockImplementation(() => mockSendVerificationEmailUseCase);
    (ResendVerificationEmailUseCase as jest.Mock).mockImplementation(() => mockResendVerificationEmailUseCase);
    (VerifyEmailUseCase as jest.Mock).mockImplementation(() => mockVerifyEmailUseCase);
    (ValidateWalletFormatUseCase as jest.Mock).mockImplementation(() => mockValidateWalletFormatUseCase);
    (VerifyWalletUseCase as jest.Mock).mockImplementation(() => mockVerifyWalletUseCase);
  });

  describe("createAuthController", () => {
    it("should create all required use cases with proper dependencies", () => {
      const authUseCases = AuthModuleFactory.createAuthController();

      // Verify all use cases are created
      expect(authUseCases.sendVerificationEmailUseCase).toBeDefined();
      expect(authUseCases.resendVerificationEmailUseCase).toBeDefined();
      expect(authUseCases.verifyEmailUseCase).toBeDefined();
      expect(authUseCases.validateWalletFormatUseCase).toBeDefined();
      expect(authUseCases.verifyWalletUseCase).toBeDefined();

      // Verify constructors were called with correct dependencies
      expect(PrismaUserRepository).toHaveBeenCalledTimes(1);
      expect(SendVerificationEmailUseCase).toHaveBeenCalledWith(mockUserRepository);
      expect(ResendVerificationEmailUseCase).toHaveBeenCalledWith(mockUserRepository);
      expect(VerifyEmailUseCase).toHaveBeenCalledWith(mockUserRepository);
      expect(ValidateWalletFormatUseCase).toHaveBeenCalledTimes(1);
      expect(VerifyWalletUseCase).toHaveBeenCalledTimes(1);
    });

    it("should return different instances on each call", () => {
      const firstInstance = AuthModuleFactory.createAuthController();
      const secondInstance = AuthModuleFactory.createAuthController();

      expect(firstInstance).not.toBe(secondInstance);
      expect(firstInstance.sendVerificationEmailUseCase).not.toBe(secondInstance.sendVerificationEmailUseCase);
    });

    it("should create use cases with the same user repository instance", () => {
      const authUseCases = AuthModuleFactory.createAuthController();

      // All use cases that depend on user repository should use the same instance
      expect(authUseCases.sendVerificationEmailUseCase).toBeDefined();
      expect(authUseCases.resendVerificationEmailUseCase).toBeDefined();
      expect(authUseCases.verifyEmailUseCase).toBeDefined();

      // Verify the user repository was created only once
      expect(PrismaUserRepository).toHaveBeenCalledTimes(1);
    });
  });
});
