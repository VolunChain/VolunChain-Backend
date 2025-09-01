import { WalletService } from "../application/services/WalletService";
import { HorizonWalletRepository } from "../repositories/HorizonWalletRepository";
import { VerifyWalletUseCase } from "../use-cases/VerifyWalletUseCase";
import { ValidateWalletFormatUseCase } from "../use-cases/ValidateWalletFormatUseCase";

export class WalletModuleFactory {
  static createWalletService(): WalletService {
    const walletRepository = new HorizonWalletRepository();
    const verifyWalletUseCase = new VerifyWalletUseCase(walletRepository);
    const validateWalletFormatUseCase = new ValidateWalletFormatUseCase();
    
    const walletService = new WalletService();
    (walletService as any).walletRepository = walletRepository;
    (walletService as any).verifyWalletUseCase = verifyWalletUseCase;
    (walletService as any).validateWalletFormatUseCase = validateWalletFormatUseCase;
    
    return walletService;
  }
}
