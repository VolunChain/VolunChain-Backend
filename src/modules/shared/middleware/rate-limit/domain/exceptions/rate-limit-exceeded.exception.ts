import { DomainException } from "@/modules/shared/domain/exceptions/domain.exception";

export class RateLimitExceededException extends DomainException {
  constructor(retryAfterMinutes: number) {
    super({
      message: `Rate limit exceeded. Try again in ${retryAfterMinutes} minutes.`,
      errorCode: "RATE_LIMIT_EXCEEDED",
      statusCode: 429,
    });
  }
}
