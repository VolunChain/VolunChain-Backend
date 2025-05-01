import { VerifyEmailUseCase } from '../../src/modules/auth/use-cases/verify-email.usecase';
import { PrismaUserRepository } from '../../src/modules/user/repositories/PrismaUserRepository';
import { IUser } from '../../src/modules/user/domain/interfaces/IUser';
import { PrismaClient } from '@prisma/client';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  let userRepository: PrismaUserRepository;
  let prismaClient: PrismaClient;
  
  // Generate unique identifiers for test users to avoid constraint violations
  const testId1 = `test-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const testId2 = `test-${Date.now()}-${Math.floor(Math.random() * 10000)}-2`;
  const testEmail1 = `test-${Date.now()}@example.com`;
  const testEmail2 = `verified-${Date.now()}@example.com`;
  const testWallet1 = `0x${Date.now().toString(16)}1`;
  const testWallet2 = `0x${Date.now().toString(16)}2`;

  beforeAll(async () => {
    // Initialize the Prisma client
    prismaClient = new PrismaClient();
    userRepository = new PrismaUserRepository();
    useCase = new VerifyEmailUseCase(userRepository);
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

  test('should verify a user with a valid token', async () => {
    // Create a test user with a verification token
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const testUser: IUser = {
      id: testId1,
      name: 'Test User',
      lastName: 'Test',
      email: testEmail1,
      password: 'password123',
      wallet: testWallet1,
      isVerified: false,
      verificationToken: 'valid-token',
      verificationTokenExpires: tomorrow
    };
    
    await userRepository.create(testUser);
    
    // Execute the use case
    const result = await useCase.execute({ token: 'valid-token' });
    
    // Assert the result
    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.message).toBe('Email verified successfully');
    
    // Check that the user is now verified
    const updatedUser = await userRepository.findById(testId1);
    expect(updatedUser?.isVerified).toBe(true);
    expect(updatedUser?.verificationToken).toBeNull();
    expect(updatedUser?.verificationTokenExpires).toBeNull();
  });
  
  test('should return error for invalid verification token', async () => {
    // Execute the use case with invalid token
    const result = await useCase.execute({ token: 'invalid-token' });
    
    // Assert the result
    expect(result.success).toBe(false);
    expect(result.verified).toBe(false);
    expect(result.message).toBe('Invalid or expired verification token');
  });
  
  test('should return success for already verified user', async () => {
    // Create a test user that is already verified
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const testUser: IUser = {
      id: testId2,
      name: 'Verified User',
      lastName: 'Test',
      email: testEmail2,
      password: 'password123',
      wallet: testWallet2,
      isVerified: true,
      verificationToken: 'some-token',
      verificationTokenExpires: tomorrow
    };
    
    await userRepository.create(testUser);
    
    // Execute the use case
    const result = await useCase.execute({ token: 'some-token' });
    
    // Assert the result
    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.message).toBe('Email already verified');
  });
});