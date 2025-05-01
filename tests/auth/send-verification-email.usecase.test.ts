import { SendVerificationEmailUseCase } from '../../src/modules/auth/use-cases/send-verification-email.usecase';
import { PrismaUserRepository } from '../../src/modules/user/repositories/PrismaUserRepository';
import { IUser } from '../../src/modules/user/domain/interfaces/IUser';
import { PrismaClient } from '@prisma/client';

// Mock email utils
jest.mock('../../src/modules/auth/utils/email.utils', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

describe('SendVerificationEmailUseCase', () => {
  let useCase: SendVerificationEmailUseCase;
  let userRepository: PrismaUserRepository;
  let emailUtils: any;
  let prismaClient: PrismaClient;
  
  // Generate unique identifiers for test users to avoid constraint violations
  const testId1 = `test-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const testId2 = `test-${Date.now()}-${Math.floor(Math.random() * 10000)}-2`;
  const testEmail1 = `test-${Date.now()}@example.com`;
  const testEmail2 = `verified-${Date.now()}@example.com`;
  const testWallet1 = `0x${Date.now().toString(16)}1`;
  const testWallet2 = `0x${Date.now().toString(16)}2`;
  const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;

  beforeAll(async () => {
    // Initialize the Prisma client
    prismaClient = new PrismaClient();
    userRepository = new PrismaUserRepository();
    useCase = new SendVerificationEmailUseCase(userRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    emailUtils = require('../../src/modules/auth/utils/email.utils');
  });

  // Clean up test data after all tests
  afterAll(async () => {
    // Delete test users created during the tests
    await prismaClient.user.deleteMany({
      where: {
        OR: [
          { id: testId1 },
          { id: testId2 }
        ]
      }
    });
    
    await prismaClient.$disconnect();
  });

  test('should send verification email to unverified user', async () => {
    // Create a test user
    const testUser: IUser = {
      id: testId1,
      name: 'Test User',
      lastName: 'Test',
      email: testEmail1,
      password: 'password123',
      wallet: testWallet1,
      isVerified: false
    };
    
    await userRepository.create(testUser);
    
    // Set environment variable for the test
    const originalBaseUrl = process.env.BASE_URL;
    process.env.BASE_URL = 'http://localhost:3000';
    
    // Execute the use case
    const result = await useCase.execute({ email: testEmail1 });
    
    // Reset environment variable
    process.env.BASE_URL = originalBaseUrl;
    
    // Assert the result
    expect(result.success).toBe(true);
    expect(result.message).toBe('Verification email sent successfully');
    
    // Check that setVerificationToken was called
    const updatedUser = await userRepository.findById(testId1);
    expect(updatedUser?.verificationToken).toBeTruthy();
    expect(updatedUser?.verificationTokenExpires).toBeTruthy();
    
    // Check that sendEmail was called with correct params
    expect(emailUtils.sendEmail).toHaveBeenCalledTimes(1);
    expect(emailUtils.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: testEmail1,
      subject: 'Email Verification'
    }));
  });
  
  test('should not send email if user is already verified', async () => {
    // Create a verified test user
    const testUser: IUser = {
      id: testId2,
      name: 'Verified User',
      lastName: 'Test',
      email: testEmail2,
      password: 'password123',
      wallet: testWallet2,
      isVerified: true
    };
    
    await userRepository.create(testUser);
    
    // Execute the use case
    const result = await useCase.execute({ email: testEmail2 });
    
    // Assert the result
    expect(result.success).toBe(true);
    expect(result.message).toBe('User is already verified');
    
    // Check that sendEmail was not called
    expect(emailUtils.sendEmail).not.toHaveBeenCalled();
  });
  
  test('should throw error if user is not found', async () => {
    // Execute the use case with non-existent email
    await expect(useCase.execute({ email: nonExistentEmail }))
      .rejects
      .toThrow('User not found');
    
    // Check that sendEmail was not called
    expect(emailUtils.sendEmail).not.toHaveBeenCalled();
  });
});