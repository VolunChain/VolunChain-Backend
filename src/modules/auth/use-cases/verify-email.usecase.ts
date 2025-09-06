import { IUserRepository } from "../../user/domain/interfaces/IUserRepository";
import {
  VerifyEmailRequestDTO,
  VerifyEmailResponseDTO,
} from "../dto/email-verification.dto";
import { ValidationException, AuthenticationException } from "../../../../shared/exceptions";

export class VerifyEmailUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: VerifyEmailRequestDTO): Promise<VerifyEmailResponseDTO> {
    try {
      const { token } = dto;

      // Find user by verification token
      const user = await this.userRepository.findByVerificationToken(token);
      if (!user) {
        throw new AuthenticationException("Invalid or expired verification token");
      }

      // If user is already verified
      if (user.isVerified) {
        return {
          success: true,
          message: "Email already verified",
          verified: true,
        };
      }

      // check if token has expired
      const now = new Date();
      if (
        user.verificationTokenExpires &&
        new Date(user.verificationTokenExpires) < now
      ) {
        throw new AuthenticationException("Verification token has expired");
      }

      // Verify user
      await this.userRepository.verifyUser(user.id);

      return {
        success: true,
        message: "Email verified successfully",
        verified: true,
      };
    } catch (error) {
      // Re-throw domain exceptions as-is
      if (error instanceof ValidationException || error instanceof AuthenticationException) {
        throw error;
      }
      // Wrap unexpected errors
      throw new AuthenticationException("Invalid or expired verification token");
    }
  }
}
