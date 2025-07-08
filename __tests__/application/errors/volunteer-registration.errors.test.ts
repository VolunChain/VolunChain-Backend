import { describe, expect, it } from '@jest/globals';
import {
  VolunteerRegistrationError,
  VolunteerPositionFullError,
  VolunteerAlreadyRegisteredError,
  VolunteerNotFoundError,
} from '../../../src/modules/volunteer/application/errors/volunteer-registration.errors';
import { DomainException } from '../../../src/modules/shared/domain/exceptions/domain.exception';

describe('VolunteerRegistrationError', () => {
  it('should create an error with a custom message', () => {
    const customMessage = 'Custom registration error';
    const error = new VolunteerRegistrationError(customMessage);

    expect(error.message).toBe(customMessage);
    expect(error).toBeInstanceOf(DomainException);
    expect(error.name).toBe('VolunteerRegistrationError');
  });

  it('should be an instance of DomainException', () => {
    const error = new VolunteerRegistrationError('Test message');

    expect(error instanceof VolunteerRegistrationError).toBe(true);
    expect(error instanceof DomainException).toBe(true);
  });
});

describe('VolunteerPositionFullError', () => {
  it('should create an error with the correct message and properties', () => {
    const error = new VolunteerPositionFullError();

    expect(error).toBeInstanceOf(DomainException);
    expect(error.message).toBe('Volunteer position is full');
    expect(error.name).toBe('VolunteerPositionFullError');
  });

  it('should extend VolunteerRegistrationError', () => {
    const error = new VolunteerPositionFullError();

    expect(error instanceof VolunteerPositionFullError).toBe(true);
    expect(error instanceof VolunteerRegistrationError).toBe(true);
    expect(error instanceof DomainException).toBe(true);
  });
});

describe('VolunteerAlreadyRegisteredError', () => {
  it('should create an error with the correct message and properties', () => {
    const error = new VolunteerAlreadyRegisteredError();

    expect(error).toBeInstanceOf(DomainException);
    expect(error.message).toBe('User is already registered for this volunteer position');
    expect(error.name).toBe('VolunteerAlreadyRegisteredError');
  });

  it('should extend VolunteerRegistrationError', () => {
    const error = new VolunteerAlreadyRegisteredError();

    expect(error instanceof VolunteerAlreadyRegisteredError).toBe(true);
    expect(error instanceof VolunteerRegistrationError).toBe(true);
    expect(error instanceof DomainException).toBe(true);
  });
});

describe('VolunteerNotFoundError', () => {
  it('should create an error with the correct message and properties', () => {
    const error = new VolunteerNotFoundError();

    expect(error).toBeInstanceOf(DomainException);
    expect(error.message).toBe('Volunteer position not found');
    expect(error.name).toBe('VolunteerNotFoundError');
  });

  it('should extend VolunteerRegistrationError', () => {
    const error = new VolunteerNotFoundError();

    expect(error instanceof VolunteerNotFoundError).toBe(true);
    expect(error instanceof VolunteerRegistrationError).toBe(true);
    expect(error instanceof DomainException).toBe(true);
  });
});

describe('Error Simulation Tests', () => {
  it('should simulate VolunteerNotFoundError being thrown', async () => {
    const simulateVolunteerNotFound = async () => {
      throw new VolunteerNotFoundError();
    };

    await expect(simulateVolunteerNotFound()).rejects.toThrow(VolunteerNotFoundError);
    await expect(simulateVolunteerNotFound()).rejects.toThrow('Volunteer position not found');
  });

  it('should simulate VolunteerPositionFullError being thrown', async () => {
    const simulatePositionFull = async () => {
      throw new VolunteerPositionFullError();
    };

    await expect(simulatePositionFull()).rejects.toThrow(VolunteerPositionFullError);
    await expect(simulatePositionFull()).rejects.toThrow('Volunteer position is full');
  });

  it('should simulate VolunteerAlreadyRegisteredError being thrown', async () => {
    const simulateAlreadyRegistered = async () => {
      throw new VolunteerAlreadyRegisteredError();
    };

    await expect(simulateAlreadyRegistered()).rejects.toThrow(VolunteerAlreadyRegisteredError);
    await expect(simulateAlreadyRegistered()).rejects.toThrow('User is already registered for this volunteer position');
  });

  it('should simulate generic VolunteerRegistrationError being thrown', async () => {
    const simulateGenericError = async () => {
      throw new VolunteerRegistrationError('Generic registration error');
    };

    await expect(simulateGenericError()).rejects.toThrow(VolunteerRegistrationError);
    await expect(simulateGenericError()).rejects.toThrow('Generic registration error');
  });
});

describe('Error Serialization', () => {
  it('should properly serialize error information', () => {
    const error = new VolunteerPositionFullError();
    const errorJson = JSON.parse(JSON.stringify(error));

    expect(errorJson.message).toBe('Volunteer position is full');
    expect(errorJson.name).toBe('VolunteerPositionFullError');
  });

  it('should maintain error inheritance in catch blocks', () => {
    try {
      throw new VolunteerAlreadyRegisteredError();
    } catch (error) {
      expect(error).toBeInstanceOf(VolunteerAlreadyRegisteredError);
      expect(error.name).toBe('VolunteerAlreadyRegisteredError');
      expect(error.message).toBe('User is already registered for this volunteer position');
    }
  });
}); 