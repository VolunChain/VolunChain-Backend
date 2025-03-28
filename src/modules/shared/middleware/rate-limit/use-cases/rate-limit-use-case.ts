// src/modules/shared/middleware/rate-limit/use-cases/rate-limit-use-case.ts
import { Request } from "express";
import { RedisRateLimitRepository } from "../repositories/redis-rate-limit-repository";
import {
  RateLimitConfig,
  DEFAULT_RATE_LIMIT_CONFIG,
} from "../domain/rate-limit-config";

export class RateLimitUseCase {
  private repository: RedisRateLimitRepository;
  private config: RateLimitConfig;

  constructor(repository?: RedisRateLimitRepository, config?: RateLimitConfig) {
    this.repository = repository || new RedisRateLimitRepository();
    this.config = config || DEFAULT_RATE_LIMIT_CONFIG;
  }

  private getIdentifier(req: Request): string {
    // Use IP or user ID if authenticated
    return req.ip || "anonymous";
  }

  private getRouteType(path: string): keyof RateLimitConfig["routes"] {
    if (path.includes("/auth")) return "auth";
    if (path.includes("/wallet")) return "wallet";
    if (path.includes("/email")) return "email";
    return "default";
  }

  async checkRateLimit(
    req: Request
  ): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
    const identifier = this.getIdentifier(req);
    const routeType = this.getRouteType(req.originalUrl);
    const routeConfig = this.config.routes[routeType];

    const currentCount = await this.repository.incrementRequest(
      identifier,
      routeType,
      routeConfig.windowMinutes
    );

    const allowed = currentCount <= routeConfig.maxRequests;
    const remaining = await this.repository.getRemainingRequests(
      identifier,
      routeType,
      routeConfig.maxRequests
    );

    return { allowed, remaining, retryAfter: routeConfig.windowMinutes };
  }
}
