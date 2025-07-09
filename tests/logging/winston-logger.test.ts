import { Request } from 'express';
import { LoggerService, createLogger } from '../../src/modules/shared/application/services/LoggerService';
import { traceIdMiddleware, getTraceId } from '../../src/middlewares/traceId.middleware';
import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Winston logger
jest.mock('../../src/config/winston.config', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock Express Request for testing
const createMockRequest = (overrides: Partial<Request> = {}): Request => {
  return {
    method: 'GET',
    url: '/test',
    ip: '127.0.0.1',
    get: jest.fn((header: string) => {
      if (header === 'User-Agent') return 'test-agent';
      return undefined;
    }),
    headers: {},
    query: {},
    params: {},
    body: {},
    traceId: 'test-trace-id-123',
    ...overrides
  } as any;
};

describe('Winston Logger Integration', () => {
  let logger: LoggerService;
  let mockWinstonLogger: any;

  beforeEach(() => {
    // Get the mocked winston logger
    mockWinstonLogger = require('../../src/config/winston.config').logger;

    // Clear all mocks
    jest.clearAllMocks();

    logger = createLogger('TEST_CONTEXT');
  });

  describe('LoggerService', () => {
    it('should create logger with context', () => {
      expect(logger).toBeInstanceOf(LoggerService);
    });

    it('should log info message with trace ID', () => {
      const mockReq = createMockRequest();

      logger.info('Test info message', mockReq, { testMeta: 'value' });

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Test info message',
        expect.objectContaining({
          traceId: 'test-trace-id-123',
          context: 'TEST_CONTEXT',
          method: 'GET',
          url: '/test',
          meta: { testMeta: 'value' }
        })
      );
    });

    it('should log error with stack trace', () => {
      const mockReq = createMockRequest();
      const testError = new Error('Test error');

      logger.error('Test error message', testError, mockReq);

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        'Test error message',
        expect.objectContaining({
          traceId: 'test-trace-id-123',
          context: 'TEST_CONTEXT',
          meta: expect.objectContaining({
            error: expect.objectContaining({
              message: 'Test error',
              name: 'Error',
              stack: expect.any(String)
            })
          })
        })
      );
    });

    it('should sanitize sensitive data in request body', () => {
      const mockReq = createMockRequest({
        body: {
          username: 'testuser',
          password: 'secret123',
          token: 'jwt-token',
          normalField: 'normal-value'
        }
      });

      logger.logRequest(mockReq);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Incoming HTTP Request',
        expect.objectContaining({
          meta: expect.objectContaining({
            body: expect.objectContaining({
              username: 'testuser',
              password: '[REDACTED]',
              token: '[REDACTED]',
              normalField: 'normal-value'
            })
          })
        })
      );
    });

    it('should create child logger with extended context', () => {
      const childLogger = logger.child('CHILD_CONTEXT');
      expect(childLogger).toBeInstanceOf(LoggerService);
    });
  });

  describe('Trace ID Middleware', () => {
    it('should add trace ID to request', () => {
      const mockReq = createMockRequest({ traceId: undefined });
      const mockRes = {
        setHeader: jest.fn()
      } as any;
      const mockNext = jest.fn();

      traceIdMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.traceId).toBeDefined();
      expect(typeof mockReq.traceId).toBe('string');
      expect(mockReq.traceId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Trace-ID', mockReq.traceId);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should get trace ID from request', () => {
      const mockReq = createMockRequest();
      const traceId = getTraceId(mockReq);
      
      expect(traceId).toBe('test-trace-id-123');
    });

    it('should return default when no trace ID', () => {
      const mockReq = createMockRequest({ traceId: undefined });
      const traceId = getTraceId(mockReq);
      
      expect(traceId).toBe('NO-TRACE-ID');
    });
  });

  describe('Log Structure Validation', () => {
    it('should include required fields in log structure', () => {
      const mockReq = createMockRequest();

      logger.info('Test structured log', mockReq, { customField: 'customValue' });

      // Validate that Winston was called with the correct structure
      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Test structured log',
        expect.objectContaining({
          traceId: 'test-trace-id-123',
          context: 'TEST_CONTEXT',
          method: 'GET',
          url: '/test',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          meta: { customField: 'customValue' }
        })
      );
    });
  });
});
