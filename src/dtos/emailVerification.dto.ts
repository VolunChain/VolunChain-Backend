export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  wallet: string;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface ResendVerificationDTO {
  email: string;
}
