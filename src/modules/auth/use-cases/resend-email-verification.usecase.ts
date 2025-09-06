import { IUserRepository } from "../../user/domain/interfaces/IUserRepository";
import { ValidationException, ConflictException } from "../../../../shared/exceptions";

export class ResendEmailVerificationUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ email }: { email: string }): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ValidationException("User not found");
    }
    if (user.isVerified) {
      throw new ConflictException("User is already verified");
    }
    
    // TODO: Implement resend logic
    // For now, just validate user state
  }
}
