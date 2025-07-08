import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  validate,
} from "class-validator";

export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  wallet: string;

  constructor(partial: Partial<RegisterDTO> = {}) {
    Object.assign(this, partial);
    this.name = this.name || "";
    this.email = this.email || "";
    this.password = this.password || "";
    this.wallet = this.wallet || "";
  }

  static validate(dto: RegisterDTO) {
    return validate(dto);
  }
}

export interface VerifyEmailDTO {
  token: string;
}

export interface ResendVerificationDTO {
  email: string;
}
