import { PrismaUserRepository } from "../../user/repositories/PrismaUserRepository";
import { SendVerificationEmailUseCase } from "../use-cases/send-verification-email.usecase";
import { ResendVerificationEmailUseCase } from "../use-cases/resend-verification-email.usecase";
import { VerifyEmailUseCase } from "../use-cases/verify-email.usecase";
import { ValidateWalletFormatUseCase } from "../use-cases/wallet-format-validation.usecase";
import { VerifyWalletUseCase } from "../use-cases/verify-wallet.usecase";

export class AuthModuleFactory {
  static createAuthController() {
    const userRepository = new PrismaUserRepository();
    const sendVerificationEmailUseCase = new SendVerificationEmailUseCase(userRepository);
    const resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(userRepository);
    const verifyEmailUseCase = new VerifyEmailUseCase(userRepository);
    const validateWalletFormatUseCase = new ValidateWalletFormatUseCase();
    const verifyWalletUseCase = new VerifyWalletUseCase();
    
    return {
      sendVerificationEmailUseCase,
      resendVerificationEmailUseCase,
      verifyEmailUseCase,
      validateWalletFormatUseCase,
      verifyWalletUseCase,
    };
  }
}
