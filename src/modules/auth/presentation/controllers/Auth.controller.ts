import { Request, Response } from "express";

// Use cases
import { validateDto } from "@/shared/middleware/validation.middleware";
import { EmailDto, LoginDto, RegisterDto, WalletDto } from "../dto";
import { asyncHandler } from "@/utils/asyncHandler";
import {
  SendVerificationEmailUseCase,
  EmailVerificationUseCase,
  ResendVerificationEmailUseCase,
  VerifyWalletUseCase,
} from "../../application/use-cases";

export class AuthController {
  constructor(
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly emailVerificationUseCase: EmailVerificationUseCase,
    private readonly resendVerificationEmailUseCase: ResendVerificationEmailUseCase,
    private readonly verifyWalletUseCase: VerifyWalletUseCase
  ) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const dto = await validateDto(RegisterDto);
    if (!dto) return;

    try {
      // Send verification email to provided address
      await this.sendVerificationEmailUseCase.execute({
        email: req.body.email,
      });
      res.status(200).json({ message: "Verification email sent" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send verification email";
      const status = message === "User not found" ? 400 : 500;
      res.status(status).json({ error: message });
    }
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const dto = await validateDto(LoginDto);
    if (!dto) return;

    // TODO: Implement Wallet auth logic as a use case
    res.status(501).json({
      message: "Login service temporarily disabled",
      error: "Wallet auth logic not implemented yet",
    });
  });

  resendVerificationEmail = asyncHandler(
    async (req: Request, res: Response) => {
      const dto = await validateDto(EmailDto);
      if (!dto) return;

      try {
        // Resends verification email to provided address
        await this.resendVerificationEmailUseCase.execute({
          email: req.body.email,
        });
        res.status(200).json({ message: "Verification email resent" });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to resend verification email";
        const status = message === "User not found" ? 404 : 500;
        res.status(status).json({ error: message });
      }
    }
  );

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const tokenParam =
      typeof req.params.token === "string" ? req.params.token : undefined;
    const tokenQuery =
      typeof req.query.token === "string"
        ? (req.query.token as string)
        : undefined;
    const token = tokenParam || tokenQuery;

    // if token is not given in the request
    if (!token) {
      res.status(400).json({
        success: false,
        message: "Token in URL is required",
        verified: false,
      });
      return;
    }

    const result = await this.emailVerificationUseCase.verifyToken(token);
    const status = result ? 200 : 400;
    res.status(status).json(result);
  });

  verifyWallet = asyncHandler(async (req: Request, res: Response) => {
    const dto = await validateDto(WalletDto);
    if (!dto) return;

    const result = await this.verifyWalletUseCase.execute({
      walletAddress: req.body.wallet,
      signature: req.body.signature,
      message: req.body.message,
    });
    const status = result.verified ? 200 : 400;
    res.status(status).json(result);
  });
}
