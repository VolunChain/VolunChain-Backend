import { DomainException } from "../../../shared/domain/exceptions/domain.exception";

export class InvalidPhotoUrlException extends DomainException {
  constructor(url: string) {
    super(`Invalid photo URL: ${url}`);
  }
}

export class MissingUserIdException extends DomainException {
  constructor() {
    super("User ID is required");
  }
}
