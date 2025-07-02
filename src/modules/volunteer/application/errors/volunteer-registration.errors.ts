import { DomainException } from "../../../shared/domain/exceptions/domain.exception";

export class VolunteerRegistrationError extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class VolunteerPositionFullError extends VolunteerRegistrationError {
  constructor() {
    super('Volunteer position is full');
  }
}

export class VolunteerAlreadyRegisteredError extends VolunteerRegistrationError {
  constructor() {
    super('User is already registered for this volunteer position');
  }
}

export class VolunteerNotFoundError extends VolunteerRegistrationError {
  constructor() {
    super('Volunteer position not found');
  }
} 