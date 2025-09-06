import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToClass } from "class-transformer";
import { ValidationException } from "../exceptions";

export function validateDto<T extends object>(dtoClass: new () => T) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto = plainToClass(dtoClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const formattedErrors = errors.map((error: ValidationError) => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints
            ? Object.values(error.constraints)
            : [],
        }));
        
        throw new ValidationException('DTO validation failed', { errors: formattedErrors });
      }

      req.body = dto;
      next();
    } catch (error) {
      // Re-throw domain exceptions as-is
      if (error instanceof ValidationException) {
        throw error;
      }
      // Wrap unexpected errors
      throw new ValidationException('Internal server error during validation');
    }
  };
}

export function validateQueryDto<T extends object>(dtoClass: new () => T) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto = plainToClass(dtoClass, req.query);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const formattedErrors = errors.map((error: ValidationError) => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints
            ? Object.values(error.constraints)
            : [],
        }));
        
        throw new ValidationException('Query validation failed', { errors: formattedErrors });
      }

      req.query = dto as Record<string, unknown>;
      next();
    } catch (error) {
      // Re-throw domain exceptions as-is
      if (error instanceof ValidationException) {
        throw error;
      }
      // Wrap unexpected errors
      throw new ValidationException('Internal server error during query validation');
    }
  };
}

export function validateParamsDto<T extends object>(dtoClass: new () => T) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto = plainToClass(dtoClass, req.params);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const formattedErrors = errors.map((error: ValidationError) => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints
            ? Object.values(error.constraints)
            : [],
        }));
        
        throw new ValidationException('Parameters validation failed', { errors: formattedErrors });
      }

      req.params = dto as Record<string, string>;
      next();
    } catch (error) {
      // Re-throw domain exceptions as-is
      if (error instanceof ValidationException) {
        throw error;
      }
      // Wrap unexpected errors
      throw new ValidationException('Internal server error during parameter validation');
    }
  };
}
