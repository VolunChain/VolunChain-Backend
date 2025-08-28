import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToClass } from "class-transformer";
import { ParsedQs } from "qs";

export interface ValidationErrorResponse {
  success: false;
  error: string;
  details: Array<{
    property: string;
    value: unknown;
    constraints: string[];
  }>;
}

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
        const errorResponse: ValidationErrorResponse = {
          success: false,
          error: "Validation failed",
          details: errors.map((error: ValidationError) => ({
            property: error.property,
            value: error.value,
            constraints: error.constraints
              ? Object.values(error.constraints)
              : [],
          })),
        };

        res.status(400).json(errorResponse);
        return;
      }

      req.body = dto;
      next();
    } catch {
      res.status(500).json({
        success: false,
        error: "Internal server error during validation",
      });
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
        const errorResponse: ValidationErrorResponse = {
          success: false,
          error: "Query validation failed",
          details: errors.map((error: ValidationError) => ({
            property: error.property,
            value: error.value,
            constraints: error.constraints
              ? Object.values(error.constraints)
              : [],
          })),
        };

        res.status(400).json(errorResponse);
        return;
      }

      req.query = dto as unknown as ParsedQs;
      next();
    } catch {
      res.status(500).json({
        success: false,
        error: "Internal server error during query validation",
      });
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
        const errorResponse: ValidationErrorResponse = {
          success: false,
          error: "Parameters validation failed",
          details: errors.map((error: ValidationError) => ({
            property: error.property,
            value: error.value,
            constraints: error.constraints
              ? Object.values(error.constraints)
              : [],
          })),
        };

        res.status(400).json(errorResponse);
        return;
      }

      req.params = dto as Record<string, string>;
      next();
    } catch {
      res.status(500).json({
        success: false,
        error: "Internal server error during parameter validation",
      });
    }
  };
}

/**
 * Validates a DTO and returns it if valid, or sends a 400 response if invalid
 * @param dtoClass - The DTO class to validate against
 * @param payload - The payload to validate
 * @param res - Express response object
 * @returns The validated DTO or undefined if validation failed
 */
export async function validateOr400<T extends object>(
  dtoClass: new () => T,
  payload: unknown,
  res: Response
): Promise<T | undefined> {
  try {
    const dto = plainToClass(dtoClass, payload);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorResponse: ValidationErrorResponse = {
        success: false,
        error: "Validation failed",
        details: errors.map((error: ValidationError) => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints
            ? Object.values(error.constraints)
            : [],
        })),
      };

      res.status(400).json(errorResponse);
      return undefined;
    }

    return dto;
  } catch {
    res.status(500).json({
      success: false,
      error: "Internal server error during validation",
    });
    return undefined;
  }
}
