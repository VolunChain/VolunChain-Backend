import express, { Request, Response, NextFunction, Router } from "express";
import { RateLimitUseCase } from "../modules/shared/middleware/rate-limit/use-cases/rate-limit-use-case";
import { Logger } from "../utils/logger";

export class RateLimitMiddleware {
  private rateLimitUseCase: RateLimitUseCase;
  private logger: Logger;

  constructor(rateLimitUseCase?: RateLimitUseCase) {
    this.rateLimitUseCase = rateLimitUseCase || new RateLimitUseCase();
    this.logger = new Logger("RATE_LIMIT_MIDDLEWARE");
  }

  rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const checkRateLimit = async () => {
      try {
        const { remaining, retryAfter } =
          await this.rateLimitUseCase.checkRateLimit(req);

        res.setHeader("X-RateLimit-Remaining", remaining.toString());
        next();
      } catch (error) {
        this.logger.error("Rate limit check failed", {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          path: req.path,
          method: req.method,
          ip: req.ip,
          traceId: req.traceId,
        });
        next(error);
      }
    };

    checkRateLimit();
  };

  applyToRoutes(router: Router, routes: string[]) {
    routes.forEach((route) => {
      router.use(route, this.rateLimiter);
    });
    return router;
  }
}

export function setupRateLimiting(app: express.Application) {
  const rateLimitMiddleware = new RateLimitMiddleware();

  app.use("/auth", rateLimitMiddleware.rateLimiter);
  app.use("/wallet", rateLimitMiddleware.rateLimiter);
  app.use("/email", rateLimitMiddleware.rateLimiter);
}
