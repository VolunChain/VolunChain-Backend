// import express from 'express';
// import request from 'supertest';
// import { RateLimitMiddleware } from '../../src/middleware/rateLimitMiddleware';

// // Mock the RateLimitUseCase to control rate limit behavior
// const createMockRateLimitUseCase = () => ({
//   checkRateLimit: jest.fn()
// });

// describe('Rate Limit Middleware', () => {
//   let app: express.Express;
//   let mockRateLimitUseCase: ReturnType<typeof createMockRateLimitUseCase>;
//   let rateLimitMiddleware: RateLimitMiddleware;

//   beforeEach(() => {
//     // Create a fresh Express application
//     app = express();

//     // Create mock use case
//     mockRateLimitUseCase = createMockRateLimitUseCase();
//     rateLimitMiddleware = new RateLimitMiddleware(mockRateLimitUseCase as any);

//     // Setup routes with middleware
//     const setupRouteWithRateLimit = (path: string, responseData: any) => {
//       app.get(path, 
//         (req, res, next) => rateLimitMiddleware.rateLimiter(req, res, next),
//         (req, res) => res.status(200).json(responseData)
//       );
//     };

//     // Add routes with rate limiting
//     setupRouteWithRateLimit('/auth/login', { message: 'Login successful' });
//     setupRouteWithRateLimit('/wallet/balance', { balance: 1000 });
//   });

//   it('should return rate limit headers when request is allowed', async () => {
//     // Setup mock for allowed request
//     mockRateLimitUseCase.checkRateLimit.mockResolvedValue({
//       allowed: true,
//       remaining: 99,
//       retryAfter: 5
//     });

//     const response = await request(app).get('/auth/login');
    
//     expect(response.status).toBe(200);
//     expect(response.headers).toHaveProperty('x-ratelimit-remaining');
//   });

//   it('should block requests when rate limit is exceeded', async () => {
//     // Setup mock for blocked request
//     mockRateLimitUseCase.checkRateLimit.mockResolvedValue({
//       allowed: false,
//       remaining: 0,
//       retryAfter: 5
//     });

//     const response = await request(app).get('/auth/login');
    
//     expect(response.status).toBe(429);
//     expect(response.body).toHaveProperty('error', 'Too Many Requests');
//   });
// });


import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { RateLimitMiddleware } from '../../src/middleware/rateLimitMiddleware';

// Mock the RateLimitUseCase to control rate limit behavior
const createMockRateLimitUseCase = () => ({
  checkRateLimit: jest.fn()
});

describe('Rate Limit Middleware', () => {
  let app: express.Express;
  let mockRateLimitUseCase: ReturnType<typeof createMockRateLimitUseCase>;
  let rateLimitMiddleware: RateLimitMiddleware;

  beforeEach(() => {
    // Create a fresh Express application
    app = express();

    // Create mock use case
    mockRateLimitUseCase = createMockRateLimitUseCase();
    rateLimitMiddleware = new RateLimitMiddleware(mockRateLimitUseCase as any);

    // Setup routes with middleware
    const setupRouteWithRateLimit = (path: string, responseData: any) => {
      app.get(
        path, 
        (req: Request, res: Response, next: NextFunction) => 
          rateLimitMiddleware.rateLimiter(req, res, next),
        (req: Request, res: Response) => {
          res.status(200).json(responseData);
        }
      );
    };

    // Add routes with rate limiting
    setupRouteWithRateLimit('/auth/login', { message: 'Login successful' });
    setupRouteWithRateLimit('/wallet/balance', { balance: 1000 });
  });

  it('should return rate limit headers when request is allowed', async () => {
    // Setup mock for allowed request
    mockRateLimitUseCase.checkRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 99,
      retryAfter: 5
    });

    const response = await request(app).get('/auth/login');
    
    expect(response.status).toBe(200);
    expect(response.headers).toHaveProperty('x-ratelimit-remaining');
  });

  it('should block requests when rate limit is exceeded', async () => {
    // Setup mock for blocked request
    mockRateLimitUseCase.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfter: 5
    });

    const response = await request(app).get('/auth/login');
    
    expect(response.status).toBe(429);
    expect(response.body).toHaveProperty('error', 'Too Many Requests');
  });
});