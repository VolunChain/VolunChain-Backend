export interface IUser {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  wallet: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganization {
  id: string;
  name: string;
  email: string;
  wallet: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProfile {
  name: string;
  email: string;
  wallet: string;
  profileType: "user" | "organization";
  category?: string;
}

export interface ILoginRequest {
  walletAddress: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  walletAddress: string;
  profileType: "user" | "project";
  lastName?: string;
  category?: string;
}

export interface ILoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: IProfile;
}

export interface IRegisterResponse {
  success: boolean;
  message: string;
  profile?: IProfile;
}

export interface IJWTPayload {
  userId: string;
  email: string;
  profileType: "user" | "organization";
  iat?: number;
  exp?: number;
}

export interface IAuthError {
  success: false;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface IAuthSuccess<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export type AuthResult<T = unknown> = IAuthSuccess<T> | IAuthError;
