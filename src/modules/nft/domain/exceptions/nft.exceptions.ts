import { DomainException } from "@/modules/shared/domain/exceptions/domain.exception";

export class AuthExceptions extends DomainException {
  constructor(field: string, value: string) {
    super(`Invalid ${field}: ${value}`);
  }
}
