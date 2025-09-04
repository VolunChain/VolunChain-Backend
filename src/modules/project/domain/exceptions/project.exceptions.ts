import { DomainException } from "@/modules/shared/domain/exceptions/domain.exception";

export class ProjectExceptions extends DomainException {
  constructor(field: string, value: string) {
    super(`Invalid ${field}: ${value}`);
  }
}
