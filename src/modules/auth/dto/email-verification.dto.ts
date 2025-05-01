export interface EmailVerificationRequestDTO {
    email: string;
  }
  
  export interface EmailVerificationResponseDTO {
    success: boolean;
    message: string;
  }
  
  export interface VerifyEmailRequestDTO {
    token: string;
  }
  
  export interface VerifyEmailResponseDTO {
    success: boolean;
    message: string;
    verified: boolean;
  }
  
  export interface ResendVerificationEmailRequestDTO {
    email: string;
  }
  
  export interface ResendVerificationEmailResponseDTO {
    success: boolean;
    message: string;
  }