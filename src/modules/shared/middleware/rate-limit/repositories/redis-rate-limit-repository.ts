import { redisClient } from "../../../../../config/redis";

export class RedisRateLimitRepository {
  private getKey(identifier: string, route: string): string {
    return `rate-limit:${route}:${identifier}`;
  }

  async incrementRequest(
    identifier: string,
    route: string,
    windowMinutes: number
  ): Promise<number> {
    const key = this.getKey(identifier, route);
    const currentCount = await redisClient.incr(key);

    if (currentCount === 1) {
      // Set expiration for the key
      await redisClient.expire(key, windowMinutes * 60);
    }

    return currentCount;
  }

  async getRemainingRequests(
    identifier: string,
    route: string,
    maxRequests: number
  ): Promise<number> {
    const key = this.getKey(identifier, route);
    const currentCount = await redisClient.get(key);

    return Math.max(
      0,
      maxRequests - (currentCount ? parseInt(currentCount) : 0)
    );
  }
}
