import { DomainException } from "@/modules/shared/domain/exceptions/domain.exception";


export class NTFException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}