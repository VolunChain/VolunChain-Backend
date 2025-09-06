import { Request, Response, NextFunction } from "express";

// imports for DTO validator
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

// Necessary DTOs
import { RegisterDto } from "../../dto/register.dto";
import { LoginDto } from "../../dto/login.dto";
import { ResendVerificationDTO } from "../../dto/resendVerificationDTO";
import {
  VerifyWalletDto,
  ValidateWalletFormatDto,
} from "../../dto/wallet-validation.dto";

// Use cases
import { PrismaUserRepository } from "../../../user/repositories/PrismaUserRepository";
import { SendVerificationEmailUseCase } from "../../use-cases/send-verification-email.usecase";
import { ResendVerificationEmailUseCase } from "../../use-cases/resend-verification-email.usecase";
import { VerifyEmailUseCase } from "../../use-cases/verify-email.usecase";
import { ValidateWalletFormatUseCase } from "../../use-cases/wallet-format-validation.usecase";
import { VerifyWalletUseCase } from "../../use-cases/verify-wallet.usecase";

// Domain exceptions
import { ValidationException, AuthenticationException, InternalServerException } from "../../../../shared/exceptions";

const userRepository = new PrismaUserRepository();
const sendVerificationEmailUseCase = new SendVerificationEmailUseCase(
  userRepository
);
const resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
  userRepository
);
const verifyEmailUseCase = new VerifyEmailUseCase(userRepository);
const validateWalletFormatUseCase = new ValidateWalletFormatUseCase();
const verifyWalletUseCase = new VerifyWalletUseCase();

// DTO validator
async function validateOr400<T>(
  Cls: new () => T,
  payload: unknown
): Promise<T> {
  const dto = plainToInstance(Cls, payload);
  const errors = await validate(dto as object, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  // DTO not verified, throw ValidationException
  if (errors.length) {
    const formattedErrors = errors.map(error => ({
      property: error.property,
      value: error.value,
      constraints: error.constraints ? Object.values(error.constraints) : [],
    }));
    throw new ValidationException('DTO validation failed', { errors: formattedErrors });
  }

  return dto;
}

const register = async (req: Request, res: Response) => {
  try {
    const dto = await validateOr400(RegisterDto, req.body);
    
    // Send verification email to provided address
    await sendVerificationEmailUseCase.execute({ email: dto.email });
    res.status(200).json({ message: "Verification email sent" });
  } catch (err) {
    // Let the global error handler deal with it
    throw err;
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const dto = await validateOr400(LoginDto, req.body);

    // TODO: Implement Wallet auth logic as a use case
    throw new InternalServerException('Login service temporarily disabled', {
      error: "Wallet auth logic not implemented yet"
    });
  } catch (err) {
    // Let the global error handler deal with it
    throw err;
  }
};

const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const dto = await validateOr400(ResendVerificationDTO, req.body);
    
    // Resends verification email to provided address
    await resendVerificationEmailUseCase.execute({ email: dto.email });
    res.status(200).json({ message: "Verification email resent" });
  } catch (err) {
    // Let the global error handler deal with it
    throw err;
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const tokenParam =
      typeof req.params.token === "string" ? req.params.token : undefined;
    const tokenQuery =
      typeof req.query.token === "string"
        ? (req.query.token as string)
        : undefined;
    const token = tokenParam || tokenQuery;

    // if token is not given in the request
    if (!token) {
      throw new ValidationException('Token in URL is required');
    }

    // Verifies email using use case
    const result = await verifyEmailUseCase.execute({ token });
    const status = result.success ? 200 : 400;
    res.status(status).json(result);
  } catch (err) {
    // Let the global error handler deal with it
    throw err;
  }
};

const verifyWallet = async (req: Request, res: Response) => {
  try {
    const dto = await validateOr400(VerifyWalletDto, req.body);
    
    const result = await verifyWalletUseCase.execute(dto);
    const status = result.verified ? 200 : 400;
    res.status(status).json(result);
  } catch (err) {
    // Let the global error handler deal with it
    throw err;
  }
};

const validateWalletFormat = async (req: Request, res: Response) => {
  try {
    const dto = await validateOr400(ValidateWalletFormatDto, req.body);
    
    // Validates wallet format using use case
    const result = await validateWalletFormatUseCase.execute(dto);
    const status = result.valid ? 200 : 400;
    res.status(status).json(result);
  } catch (err) {
    // Let the global error handler deal with it
    throw err;
  }
};

export default {
  register,
  login,
  resendVerificationEmail,
  verifyEmail,
  verifyWallet,
  validateWalletFormat,
};
