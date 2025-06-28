import express, { Request, Response, NextFunction, Router } from "express";
import { RateLimitUseCase } from "./../modules/shared/middleware/rate-limit/use-cases/rate-limit-use-case";
import { createLogger } from "../modules/shared/application/services/LoggerService";

export class RateLimitMiddleware {
  private rateLimitUseCase: RateLimitUseCase;
  private logger: ReturnType<typeof createLogger>;

  constructor(rateLimitUseCase?: RateLimitUseCase) {
    this.rateLimitUseCase = rateLimitUseCase || new RateLimitUseCase();
    this.logger = createLogger("RATE_LIMIT_MIDDLEWARE");
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
          this.logger.warn(
            `Rate limit exceeded for ${req.ip} on ${req.path}`,
            req,
            {
              remaining,
              retryAfter,
              ip: req.ip,
              path: req.path,
            }
          );
          return res.status(429).json({
            error: "Too Many Requests",
            message:
              "You have exceeded the rate limit. Please try again later.",
            retryAfter: retryAfter * 60 + " seconds", // Default retry after 1 minute
            ...(req.traceId && { traceId: req.traceId }),
          });
        }

        next();
      } catch (error) {
        this.logger.error("Rate limit check failed", error, req);
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
