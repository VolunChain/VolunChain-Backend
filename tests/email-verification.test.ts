import { PrismaUserRepository } from '../src/modules/user/repositories/PrismaUserRepository';
import AuthService from '../src/services/AuthService';
import { sendVerificationEmail } from '../src/utils/email.utils';
import jwt from 'jsonwebtoken';

// Mock the prisma import directly from config
jest.mock('../src/config/prisma', () => {
  const mockUserMethods = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  
  return {
    prisma: {
      user: mockUserMethods
    }
  };
});

const { prisma } = require('../src/config/prisma');

jest.mock('../src/utils/email.utils', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

type JwtMock = {
  sign: jest.Mock;
  verify: jest.Mock;
};

jest.mock('jsonwebtoken', (): JwtMock => ({
  sign: jest.fn().mockReturnValue('mock-verification-token'),
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'valid-token' || token === 'mock-verification-token') {
      return { email: 'test@example.com' };
    }
    if (token === 'expired-token') {
      throw new Error('jwt expired');
    }
    throw new Error('invalid token');
  }),
}));

describe('Email Verification', () => {
  let authService: AuthService;
  let userRepository: PrismaUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    
    userRepository = new PrismaUserRepository();
    authService = new AuthService();
  });

  describe('Registration with email verification', () => {
    it('should send verification email upon registration', async () => {
      // Mock user not existing yet
      prisma.user.findUnique.mockResolvedValueOnce(null);
      
      // Mock user creation
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        wallet: 'wallet123',
        isVerified: false,
        verificationToken: 'mock-verification-token',
        verificationTokenExpiresAt: new Date(Date.now() + 3600000),
      };
      prisma.user.create.mockResolvedValueOnce(mockUser);

      const result = await authService.register(
        'Test User', 
        'test@example.com', 
        'password123', 
        'wallet123'
      );

      expect(result.message).toContain('Registration successful');
      expect(sendVerificationEmail).toHaveBeenCalledWith('test@example.com', 'mock-verification-token');
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

      // Mock JWT verify to return the correct email
      (jwt.verify as jest.Mock).mockReturnValueOnce({ email: 'test@example.com' });

      // Mock finding the user by email - this is the key change
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      
      // Mock updating the user
      const updatedUser = {
        ...mockUser,
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null
      };
      prisma.user.update.mockResolvedValueOnce(updatedUser);

      const result = await authService.verifyEmail('valid-token');

      expect(result.message).toContain('successfully verified');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: { 
          isVerified: true,
          verificationToken: null,
          verificationTokenExpiresAt: null
        }
      });
    });

    it('should reject expired tokens', async () => {
      // JWT verify will throw an error for expired token
      await expect(authService.verifyEmail('expired-token')).rejects.toThrow('Invalid or expired verification token');
    });

    it('should handle case where token is valid but verification date is expired', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday
      
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        isVerified: false,
        verificationToken: 'valid-token',
        verificationTokenExpiresAt: expiredDate
      };

      (jwt.verify as jest.Mock).mockReturnValueOnce({ email: 'test@example.com' });
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);

      await expect(authService.verifyEmail('valid-token')).rejects.toThrow('Invalid or expired verification token');
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

      // Mock finding the user
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      
      // Mock updating the user with new token
      prisma.user.update.mockResolvedValueOnce({
        ...mockUser,
        verificationToken: 'mock-verification-token',
        verificationTokenExpiresAt: expect.any(Date)
      });

      const result = await authService.resendVerificationEmail('test@example.com');

      expect(result.message).toContain('Verification email resent');
      expect(sendVerificationEmail).toHaveBeenCalledWith('test@example.com', 'mock-verification-token');
    });

    it('should not resend email for already verified users', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        wallet: 'wallet123',
        isVerified: true,
      };

      // Mock finding the user
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await authService.resendVerificationEmail('test@example.com');

      expect(result.message).toContain('already verified');
      expect(sendVerificationEmail).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});