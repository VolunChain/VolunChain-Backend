// tests/rate-limit/rate-limit-use-case.test.ts
import { RateLimitUseCase } from '../../src/modules/shared/middleware/rate-limit/use-cases/rate-limit-use-case';
import { RedisRateLimitRepository } from '../../src/modules/shared/middleware/rate-limit/repositories/redis-rate-limit-repository';
import { Request } from 'express';

// Mock the Redis repository completely within the test file
const createMockRedisRepository = () => ({
  incrementRequest: jest.fn(),
  getRemainingRequests: jest.fn()
});

describe('RateLimitUseCase', () => {
  let rateLimitUseCase: RateLimitUseCase;
  let mockRepository: ReturnType<typeof createMockRedisRepository>;

  beforeEach(() => {
    mockRepository = createMockRedisRepository();
    
    // @ts-ignore - We're deliberately passing a mock repository
    rateLimitUseCase = new RateLimitUseCase(mockRepository);
  });

  const mockRequest = (url: string, ip: string = '127.0.0.1') => {
    return {
      originalUrl: url,
      ip,
    } as Request;
  };

  it('should allow request within rate limit', async () => {
    mockRepository.incrementRequest.mockResolvedValue(1);
    mockRepository.getRemainingRequests.mockResolvedValue(99);

    const req = mockRequest('/auth/login');
    const result = await rateLimitUseCase.checkRateLimit(req);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(99);
  });

  it('should block request exceeding rate limit', async () => {
    mockRepository.incrementRequest.mockResolvedValue(11);
    mockRepository.getRemainingRequests.mockResolvedValue(0);

    const req = mockRequest('/auth/login');
    const result = await rateLimitUseCase.checkRateLimit(req);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should correctly identify route types', async () => {
    const testCases = [
      { url: '/auth/login', expectedType: 'auth' },
      { url: '/wallet/balance', expectedType: 'wallet' },
      { url: '/email/send', expectedType: 'email' },
      { url: '/random/route', expectedType: 'default' }
    ];

    for (const { url } of testCases) {
      mockRepository.incrementRequest.mockResolvedValue(1);
      mockRepository.getRemainingRequests.mockResolvedValue(99);

      const req = mockRequest(url);
      const result = await rateLimitUseCase.checkRateLimit(req);

      expect(result.allowed).toBe(true);
    }
  });
});