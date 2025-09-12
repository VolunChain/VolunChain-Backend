import { WalletService } from "../../application/services/WalletService";
import { HorizonWalletRepository } from "../../repositories/HorizonWalletRepository";
import { VerifyWalletUseCase } from "../../use-cases/VerifyWalletUseCase";
import { ValidateWalletFormatUseCase } from "../../use-cases/ValidateWalletFormatUseCase";
import { WalletVerificationResponseDto } from "../../dto/WalletVerificationResponseDto";

jest.mock("../../repositories/HorizonWalletRepository");
jest.mock("../../use-cases/VerifyWalletUseCase");
jest.mock("../../use-cases/ValidateWalletFormatUseCase");

describe("WalletService", () => {
  let walletService: WalletService;
  let mockHorizonWalletRepository: jest.Mocked<HorizonWalletRepository>;
  let mockVerifyWalletUseCase: jest.Mocked<VerifyWalletUseCase>;
  let mockValidateWalletFormatUseCase: jest.Mocked<ValidateWalletFormatUseCase>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockHorizonWalletRepository =
      new HorizonWalletRepository() as jest.Mocked<HorizonWalletRepository>;
    mockVerifyWalletUseCase = new VerifyWalletUseCase(
      mockHorizonWalletRepository
    ) as jest.Mocked<VerifyWalletUseCase>;
    mockValidateWalletFormatUseCase =
      new ValidateWalletFormatUseCase() as jest.Mocked<ValidateWalletFormatUseCase>;

    walletService = new WalletService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (walletService as any).walletRepository = mockHorizonWalletRepository;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (walletService as any).verifyWalletUseCase = mockVerifyWalletUseCase;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (walletService as any).validateWalletFormatUseCase =
      mockValidateWalletFormatUseCase;
  });

  describe("validateWalletFormat", () => {
    it("should validate wallet format successfully", async () => {
      const walletAddress =
        "GCKFBEIYTKP5RHGR4QJQW2PCYXA4MFDBBHC6VQM7Z6N2XYW7TGNXLR3Z";
      const expectedResponse: WalletVerificationResponseDto = {
        success: true,
        isValid: true,
        walletAddress,
        accountExists: false,
        message: "Wallet format is valid",
        verifiedAt: new Date(),
      };

      mockValidateWalletFormatUseCase.execute.mockResolvedValue(
        expectedResponse
      );

      const result = await walletService.validateWalletFormat(walletAddress);

      expect(result).toEqual(expectedResponse);
      expect(mockValidateWalletFormatUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          walletAddress,
        })
      );
    });

    it("should return invalid format response for invalid wallet", async () => {
      const walletAddress = "invalid-wallet";
      const expectedResponse: WalletVerificationResponseDto = {
        success: false,
        isValid: false,
        walletAddress,
        accountExists: false,
        message: "Invalid wallet format",
        verifiedAt: new Date(),
      };

      mockValidateWalletFormatUseCase.execute.mockResolvedValue(
        expectedResponse
      );

      const result = await walletService.validateWalletFormat(walletAddress);

      expect(result).toEqual(expectedResponse);
      expect(mockValidateWalletFormatUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          walletAddress,
        })
      );
    });
  });

  describe("verifyWallet", () => {
    it("should verify wallet successfully", async () => {
      const walletAddress =
        "GCKFBEIYTKP5RHGR4QJQW2PCYXA4MFDBBHC6VQM7Z6N2XYW7TGNXLR3Z";
      const expectedResponse: WalletVerificationResponseDto = {
        success: true,
        isValid: true,
        walletAddress,
        accountExists: true,
        message: "Wallet is valid and exists on network",
        verifiedAt: new Date(),
      };

      mockVerifyWalletUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await walletService.verifyWallet(walletAddress);

      expect(result).toEqual(expectedResponse);
      expect(mockVerifyWalletUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          walletAddress,
        })
      );
    });

    it("should return invalid response for non-existent wallet", async () => {
      const walletAddress =
        "GCKFBEIYTKP5RHGR4QJQW2PCYXA4MFDBBHC6VQM7Z6N2XYW7TGNXLR3Z";
      const expectedResponse: WalletVerificationResponseDto = {
        success: false,
        isValid: false,
        walletAddress,
        accountExists: false,
        message: "Wallet does not exist on network",
        verifiedAt: new Date(),
      };

      mockVerifyWalletUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await walletService.verifyWallet(walletAddress);

      expect(result).toEqual(expectedResponse);
      expect(mockVerifyWalletUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          walletAddress,
        })
      );
    });
  });

  describe("isWalletValid", () => {
    it("should return true for valid wallet", async () => {
      const walletAddress =
        "GCKFBEIYTKP5RHGR4QJQW2PCYXA4MFDBBHC6VQM7Z6N2XYW7TGNXLR3Z";
      const mockResponse: WalletVerificationResponseDto = {
        success: true,
        isValid: true,
        walletAddress,
        accountExists: true,
        message: "Wallet is valid",
        verifiedAt: new Date(),
      };

      mockVerifyWalletUseCase.execute.mockResolvedValue(mockResponse);

      const result = await walletService.isWalletValid(walletAddress);

      expect(result).toBe(true);
      expect(mockVerifyWalletUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          walletAddress,
        })
      );
    });

    it("should return false for invalid wallet", async () => {
      const walletAddress = "invalid-wallet";
      const mockResponse: WalletVerificationResponseDto = {
        success: false,
        isValid: false,
        walletAddress,
        accountExists: false,
        message: "Wallet is invalid",
        verifiedAt: new Date(),
      };

      mockVerifyWalletUseCase.execute.mockResolvedValue(mockResponse);

      const result = await walletService.isWalletValid(walletAddress);

      expect(result).toBe(false);
    });

    it("should return false when verification throws error", async () => {
      const walletAddress =
        "GCKFBEIYTKP5RHGR4QJQW2PCYXA4MFDBBHC6VQM7Z6N2XYW7TGNXLR3Z";

      mockVerifyWalletUseCase.execute.mockRejectedValue(
        new Error("Network error")
      );

      const result = await walletService.isWalletValid(walletAddress);

      expect(result).toBe(false);
    });

    it("should return false when success is true but isValid is false", async () => {
      const walletAddress =
        "GCKFBEIYTKP5RHGR4QJQW2PCYXA4MFDBBHC6VQM7Z6N2XYW7TGNXLR3Z";
      const mockResponse: WalletVerificationResponseDto = {
        success: true,
        isValid: false,
        walletAddress,
        accountExists: false,
        message: "Wallet format is valid but does not exist",
        verifiedAt: new Date(),
      };

      mockVerifyWalletUseCase.execute.mockResolvedValue(mockResponse);

      const result = await walletService.isWalletValid(walletAddress);

      expect(result).toBe(false);
    });
  });
});
