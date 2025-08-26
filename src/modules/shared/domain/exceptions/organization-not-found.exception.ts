import { DomainException } from "./domain.exception";

export class OrganizationNotFoundException extends DomainException {
  constructor(id: string) {
    super({
      message: `Organization with ID ${id} not found`,
      errorCode: "ORGANIZATION_NOT_FOUND",
      statusCode: 404,
    });
  }
}
