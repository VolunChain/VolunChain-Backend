import { IUserRepository } from "../repository/IUserRepository";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "../utils/email.utils";

export class EmailVerificationUseCase {
  constructor(private userRepository: IUserRepository) {}

  async sendVerificationEmail(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");
    if (user.isVerified) throw new Error("User is already verified");

    const token = randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.userRepository.updateVerificationToken(user.id, token, expires);

    const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;

    await sendVerificationEmail(user.email, verificationLink);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) throw new Error("Invalid or expired token");

    if (
      user.verificationTokenExpires &&
      new Date() > user.verificationTokenExpires
    ) {
      throw new Error(
        "Token expired. Please request a new verification email."
      );
    }

    await this.userRepository.updateVerificationStatus(user.id);
  }
}
