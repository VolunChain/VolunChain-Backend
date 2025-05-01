import bcrypt from 'bcryptjs';
import { prisma } from "../config/prisma";
import jwt from 'jsonwebtoken';
import { PrismaUserRepository } from '../modules/user/repositories/PrismaUserRepository';
import { SendVerificationEmailUseCase } from '../modules/auth/use-cases/send-verification-email.usecase';
import { VerifyEmailUseCase } from '../modules/auth/use-cases/verify-email.usecase';
import { ResendVerificationEmailUseCase } from '../modules/auth/use-cases/resend-verification-email.usecase';

class AuthService {
  private userRepository: PrismaUserRepository;
  private sendVerificationEmailUseCase: SendVerificationEmailUseCase;
  private verifyEmailUseCase: VerifyEmailUseCase;
  private resendVerificationEmailUseCase: ResendVerificationEmailUseCase;

  constructor() {
    this.userRepository = new PrismaUserRepository();
    this.sendVerificationEmailUseCase = new SendVerificationEmailUseCase(this.userRepository);
    this.verifyEmailUseCase = new VerifyEmailUseCase(this.userRepository);
    this.resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(this.userRepository);
  }

  async authenticate(walletAddress: string): Promise<string> {
    const SECRET_KEY = process.env.JWT_SECRET || "defaultSecret";
    const user = await prisma.user.findUnique({
      where: { wallet: walletAddress },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
  }

  async register(name: string, lastName: string, email: string, password: string, wallet: string) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await this.userRepository.create({
      id: '',
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
      message: 'User registered successfully. Please check your email to verify your account.',
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
      message: isVerified 
        ? "Email is verified" 
        : "Email is not verified"
    };
  }
}

export default AuthService;
