import { IUserRepository } from '../../user/domain/interfaces/IUserRepository';
import { VerifyEmailRequestDTO, VerifyEmailResponseDTO } from '../dto/email-verification.dto';

export class VerifyEmailUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: VerifyEmailRequestDTO): Promise<VerifyEmailResponseDTO> {
    try{
      const { token } = dto;

      // Find user by verification token
      const user = await this.userRepository.findByVerificationToken(token);
      if (!user) {
        return {
          success: false,
          message: 'Invalid or expired verification token',
          verified: false,
        };
      }

      // If user is already verified
      if (user.isVerified) {
        return {
          success: true,
          message: 'Email already verified',
          verified: true,
        };
      }
      
      // check if token has expired
      const now = new Date();
      if (user.verificationTokenExpires && new Date(user.verificationTokenExpires) < now) {
        throw new Error("Verification token has expired");
      }

      // Verify user
      await this.userRepository.verifyUser(user.id);

      return {
        success: true,
        message: 'Email verified successfully',
        verified: true,
      };
    }catch(error){
      throw new Error("Invalid or expired verification token");
      }
}
}