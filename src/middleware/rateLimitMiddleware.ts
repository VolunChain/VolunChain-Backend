import express, { Request, Response, NextFunction, Router } from "express";
import { RateLimitUseCase } from "./../modules/shared/middleware/rate-limit/use-cases/rate-limit-use-case";
import { Logger } from "./../utils/logger";

export class RateLimitMiddleware {
  private rateLimitUseCase: RateLimitUseCase;
  private logger: Logger;

  constructor(rateLimitUseCase?: RateLimitUseCase) {
    this.rateLimitUseCase = rateLimitUseCase || new RateLimitUseCase();
    this.logger = new Logger("RateLimitMiddleware");
  }

  // Returning a middleware function
  rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const checkRateLimit = async () => {
      try {
        const { allowed, remaining, retryAfter } =
          await this.rateLimitUseCase.checkRateLimit(req);
        console.log(allowed, remaining);

        // Add rate limit headers
        res.setHeader("X-RateLimit-Remaining", remaining.toString());

        if (!allowed) {
          this.logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
          return res.status(429).json({
            error: "Too Many Requests",
            message:
              "You have exceeded the rate limit. Please try again later.",
            retryAfter: retryAfter * 60 + " seconds", // Default retry after 1 minute
          });
        }

        next();
      } catch (error) {
        this.logger.error("Rate limit check failed", error);
        next(error);
      }
    };

    checkRateLimit();
  };

  //Method to apply middleware to specific routes
  applyToRoutes(router: Router, routes: string[]) {
    routes.forEach((route) => {
      router.use(route, this.rateLimiter);
    });
    return router;
  }
}

export function setupRateLimiting(app: express.Application) {
  const rateLimitMiddleware = new RateLimitMiddleware();

  // Explicit typing and direct method application
  app.use("/auth", rateLimitMiddleware.rateLimiter);
  app.use("/wallet", rateLimitMiddleware.rateLimiter);
  app.use("/email", rateLimitMiddleware.rateLimiter);
}
