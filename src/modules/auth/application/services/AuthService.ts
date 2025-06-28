import bcrypt from "bcryptjs";
import { prisma } from "../../../../config/prisma";
import jwt from "jsonwebtoken";
import { PrismaUserRepository } from "../../../user/repositories/PrismaUserRepository";
import { SendVerificationEmailUseCase } from "../../use-cases/send-verification-email.usecase";
import { VerifyEmailUseCase } from "../../use-cases/verify-email.usecase";
import { ResendVerificationEmailUseCase } from "../../use-cases/resend-verification-email.usecase";
import { WalletService } from "../../../wallet/services/WalletService";

class AuthService {
  private userRepository: PrismaUserRepository;
  private sendVerificationEmailUseCase: SendVerificationEmailUseCase;
  private verifyEmailUseCase: VerifyEmailUseCase;
  private resendVerificationEmailUseCase: ResendVerificationEmailUseCase;
  private walletService: WalletService;

  constructor() {
    this.userRepository = new PrismaUserRepository();
    this.sendVerificationEmailUseCase = new SendVerificationEmailUseCase(
      this.userRepository
    );
    this.verifyEmailUseCase = new VerifyEmailUseCase(this.userRepository);
    this.resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
      this.userRepository
    );
    this.walletService = new WalletService();
  }

  async authenticate(walletAddress: string): Promise<string> {
    const SECRET_KEY = process.env.JWT_SECRET || "defaultSecret";

    // First verify the wallet address is valid
    const isWalletValid = await this.walletService.isWalletValid(walletAddress);
    if (!isWalletValid) {
      throw new Error("Invalid wallet address");
    }

    const user = await prisma.user.findUnique({
      where: { wallet: walletAddress },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
  }

  async register(
    name: string,
    lastName: string,
    email: string,
    password: string,
    wallet: string
  ) {
    // Verify wallet address first
    const walletVerification = await this.walletService.verifyWallet(wallet);
    if (!walletVerification.success || !walletVerification.isValid) {
      throw new Error(
        `Wallet verification failed: ${walletVerification.message}`
      );
    }

    // Check if user already exists by email
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Check if wallet is already registered
    const existingWalletUser = await prisma.user.findUnique({
      where: { wallet: wallet },
    });
    if (existingWalletUser) {
      throw new Error("This wallet address is already registered");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await this.userRepository.create({
      id: "",
      name,
      lastName,
      email,
      password: hashedPassword,
      wallet,
      isVerified: false,
    });

    // Send verification email
    await this.sendVerificationEmailUseCase.execute({ email });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      wallet: user.wallet,
      walletVerified: walletVerification.accountExists,
      message:
        "User registered successfully. Please check your email to verify your account.",
    };
  }

  async verifyEmail(token: string) {
    return this.verifyEmailUseCase.execute({ token });
  }

  async resendVerificationEmail(email: string) {
    return this.resendVerificationEmailUseCase.execute({ email });
  }

  async checkVerificationStatus(userId: string) {
    const isVerified = await this.userRepository.isUserVerified(userId);
    return {
      isVerified,
      message: isVerified ? "Email is verified" : "Email is not verified",
    };
  }

  async verifyWalletAddress(walletAddress: string) {
    return this.walletService.verifyWallet(walletAddress);
  }

  async validateWalletFormat(walletAddress: string) {
    return this.walletService.validateWalletFormat(walletAddress);
  }
}

export default AuthService;
