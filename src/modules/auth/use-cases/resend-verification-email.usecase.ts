import jwt from "jsonwebtoken";
import { IUserRepository } from '../../user/domain/interfaces/IUserRepository';
import { ResendVerificationEmailRequestDTO, ResendVerificationEmailResponseDTO } from '../dto/email-verification.dto';
import { sendEmail } from '../utils/email.utils';

export class ResendVerificationEmailUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: ResendVerificationEmailRequestDTO): Promise<ResendVerificationEmailResponseDTO> {
    const { email } = dto;
    const EMAIL_SECRET = process.env.EMAIL_SECRET || "emailSecret";

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // If user is already verified
    if (user.isVerified) {
      return {
        success: true,
        message: 'User is already verified',
      };
    }

    // Generate new verification token
    const token = jwt.sign({ email }, EMAIL_SECRET, { expiresIn: "1d" });;
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24); // Token expires in 24 hours

    // Save verification token
    await this.userRepository.setVerificationToken(user.id, token, tokenExpires);

    // Send verification email
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Email Verification',
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return {
      success: true,
      message: 'Verification email resent successfully',
    };
  }
}