import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObject = plainToClass(dtoClass, req.body);
    const errors = await validate(dtoObject, { skipMissingProperties: true });

    if (errors.length > 0) {
      const errorMessages = errors.map((error: ValidationError) => {
        if (error.constraints) {
          return Object.values(error.constraints);
        }
        return [];
      }).flat();

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    req.body = dtoObject;
    next();
  };
}; 