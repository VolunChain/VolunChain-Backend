import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";

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
      const dto = plainToInstance(dtoClass, req.body);
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
      const dto = plainToInstance(dtoClass, req.query);
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

      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, dto);

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
      const dto = plainToInstance(dtoClass, req.params);
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
