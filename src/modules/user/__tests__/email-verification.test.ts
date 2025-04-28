import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import AuthService from '../../../services/AuthService';
import { sendVerificationEmail } from '../../../utils/email.utils';

// Mock dependencies
jest.mock('../../../utils/email.utils', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    })),
  };
});

describe('Email Verification', () => {
  let authService: AuthService;
  let prismaUserRepository: PrismaUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaUserRepository = new PrismaUserRepository();
    authService = new AuthService();
  });

  describe('Registration with email verification', () => {
    it('should send verification email upon registration', async () => {
      // Mock user repository methods
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        wallet: 'wallet123',
        isVerified: false,
      };

      jest.spyOn(prismaUserRepository, 'findByEmail').mockResolvedValueOnce(null);
      jest.spyOn(prismaUserRepository, 'create').mockResolvedValueOnce(mockUser);

      const result = await authService.register(
        'Test User', 
        'test@example.com', 
        'password123', 
        'wallet123'
      );

      expect(result.message).toContain('Registration successful');
      expect(sendVerificationEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
    });
  });

  describe('Email verification', () => {
    it('should verify a user with valid token', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        wallet: 'wallet123',
        isVerified: false,
        verificationToken: 'valid-token',
        verificationTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      };

      jest.spyOn(prismaUserRepository, 'findByVerificationToken').mockResolvedValueOnce(mockUser);
      jest.spyOn(prismaUserRepository, 'markEmailAsVerified').mockResolvedValueOnce();

      const result = await authService.verifyEmail('valid-token');

      expect(result.message).toContain('successfully verified');
      expect(prismaUserRepository.markEmailAsVerified).toHaveBeenCalledWith('123');
    });

    it('should reject expired tokens', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        wallet: 'wallet123',
        isVerified: false,
        verificationToken: 'expired-token',
        verificationTokenExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };

      jest.spyOn(prismaUserRepository, 'findByVerificationToken').mockResolvedValueOnce(mockUser);

      await expect(authService.verifyEmail('expired-token')).rejects.toThrow('expired');
    });
  });

  describe('Resend verification email', () => {
    it('should resend verification email for unverified users', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        wallet: 'wallet123',
        isVerified: false,
      };

      jest.spyOn(prismaUserRepository, 'findByEmail').mockResolvedValueOnce(mockUser);
      jest.spyOn(prismaUserRepository, 'updateVerificationToken').mockResolvedValueOnce();

      const result = await authService.resendVerificationEmail('test@example.com');

      expect(result.message).toContain('Verification email resent');
      expect(sendVerificationEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
    });

    it('should not resend email for already verified users', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        wallet: 'wallet123',
        isVerified: true,
      };

      jest.spyOn(prismaUserRepository, 'findByEmail').mockResolvedValueOnce(mockUser);

      const result = await authService.resendVerificationEmail('test@example.com');

      expect(result.message).toContain('already verified');
      expect(sendVerificationEmail).not.toHaveBeenCalled();
    });
  });
});